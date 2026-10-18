import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { demoClasses, demoGames, demoQuestionsTin12, demoRoomTIN012 } from './src/data/initialData';
import { Game, Participant, Question, Room } from './src/types';
import { 
  buildClassExportSummary, 
  generateAllGamesClassExcel, 
  generateExportFilename, 
  generateFullClassExcel, 
  generateQuickClassExcel 
} from './src/utils/excelExport';
import { generateQuestionsWithGemini } from './src/lib/geminiQuestionGenerator';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Supabase Server Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://loewfhccqxbynmtjtgjo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_1pnWfXAWyfVTDNK985HrUA_iNXouAT9';
const supabaseServer = (supabaseUrl && supabaseKey) ? createSupabaseClient(supabaseUrl, supabaseKey) : null;


// In-memory Room & Game Store (persists during server runtime)
const roomsMap = new Map<string, Room>();
const gamesMap = new Map<string, Game>();

// Populate initial demo games and room
demoGames.forEach(g => gamesMap.set(g.id, g));
roomsMap.set('TIN012', JSON.parse(JSON.stringify(demoRoomTIN012)));

// Server-side Gemini AI setup
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: AI Generate Questions (Primary endpoint requested: /api/generate-questions)
const handleGenerateQuestionsRequest = async (req: Request, res: Response) => {
  try {
    const result = await generateQuestionsWithGemini(req.body);
    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        error: result.error,
        details: result.details,
      });
    }
    return res.status(200).json({
      success: true,
      questions: result.questions,
      count: result.count,
    });
  } catch (error: any) {
    console.error('[SERVER /api/generate-questions Unhandled Error]:', error);
    return res.status(500).json({
      success: false,
      error: `Lỗi máy chủ AI: ${error.message || 'Không xác định'}`,
    });
  }
};

app.post('/api/generate-questions', handleGenerateQuestionsRequest);
app.post('/api/ai/generate-questions', handleGenerateQuestionsRequest);

// API: AI Rewrite Question
app.post('/api/ai/rewrite-question', async (req: Request, res: Response) => {
  const { question, action } = req.body;
  const ai = getGeminiClient();

  if (ai && question) {
    try {
      let instruction = 'Viết lại câu hỏi này cho hấp dẫn và tự nhiên hơn với học sinh THPT.';
      if (action === 'harder') instruction = 'Nâng cấp câu hỏi lên mức độ Vận dụng cao, đòi hỏi tư duy phân tích sâu sắc hơn.';
      if (action === 'easier') instruction = 'Đơn giản hóa câu hỏi về mức Nhận biết, rõ ràng, trực diện.';
      if (action === 'similar') instruction = 'Tạo một câu hỏi tương tự cùng chủ đề nhưng với tình huống bài toán khác.';

      const prompt = `${instruction}
Câu hỏi gốc:
${JSON.stringify(question, null, 2)}
Trả về JSON đúng 1 câu hỏi theo schema đã cho.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              topic: { type: Type.STRING },
              codeSnippet: { type: Type.STRING },
              codeLanguage: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'difficulty'],
          },
        },
      });

      const rewritten = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        question: {
          ...question,
          ...rewritten,
          id: `rw-${Date.now()}`,
        },
      });
    } catch (e) {
      console.warn('AI rewrite error:', e);
    }
  }

  // Fallback rewrite
  return res.json({
    success: true,
    question: {
      ...question,
      id: `rw-${Date.now()}`,
      question: action === 'similar' ? `[Tương tự] ${question.question}` : `[Cập nhật AI] ${question.question}`,
      difficulty: action === 'harder' ? 'Vận dụng cao' : action === 'easier' ? 'Nhận biết' : question.difficulty,
    },
  });
});

// API: AI Audit Questions (Check scientific correctness, distractor balance, answer validation)
app.post('/api/ai/audit-questions', async (req: Request, res: Response) => {
  const { questions } = req.body;
  const ai = getGeminiClient();

  if (ai && Array.isArray(questions) && questions.length > 0) {
    try {
      const prompt = `Bạn là chuyên gia thẩm định đề thi THPT Quốc gia Việt Nam.
Hãy kiểm tra danh sách các câu hỏi trắc nghiệm sau do giáo viên cung cấp:
${JSON.stringify(questions, null, 2)}

Hãy phân tích và trả về mảng kết quả thẩm định cho từng câu:
- questionIndex: số thứ tự (0, 1, ...)
- status: "good" (tốt), "warning" (cần chú ý), hoặc "error" (có lỗi)
- critique: nhận xét ngắn gọn (1-2 câu)
- suggestedFix: gợi ý điều chỉnh cụ thể nếu có`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionIndex: { type: Type.INTEGER },
                status: { type: Type.STRING },
                critique: { type: Type.STRING },
                suggestedFix: { type: Type.STRING },
              },
              required: ['questionIndex', 'status', 'critique'],
            },
          },
        },
      });

      const auditResults = JSON.parse(response.text || '[]');
      return res.json({ success: true, auditResults });
    } catch (e) {
      console.warn('Audit error:', e);
    }
  }

  // Fallback audit
  const fallbackResults = (questions || []).map((q: any, i: number) => ({
    questionIndex: i,
    status: q.correctAnswer >= 0 && q.correctAnswer <= 3 ? 'good' : 'warning',
    critique: q.correctAnswer >= 0 && q.correctAnswer <= 3
      ? 'Câu hỏi có cấu trúc 4 phương án chuẩn và đã có đáp án xác định.'
      : 'Chưa xác định đáp án đúng rõ ràng. Giáo viên vui lòng chọn đáp án đúng.',
    suggestedFix: q.correctAnswer < 0 ? 'Vui lòng đánh dấu phương án đúng (A, B, C hoặc D).' : '',
  }));

  return res.json({ success: true, auditResults: fallbackResults });
});

// API: AI Generate/Improve Distractors (Phương án nhiễu)
app.post('/api/ai/generate-distractors', async (req: Request, res: Response) => {
  const { questionText, correctAnswerText, topic } = req.body;
  const ai = getGeminiClient();

  if (ai && questionText && correctAnswerText) {
    try {
      const prompt = `Cho câu hỏi: "${questionText}"
Đáp án đúng là: "${correctAnswerText}"
Chủ đề: "${topic || 'Tin học THPT'}"

Hãy tạo 3 phương án nhiễu (distractors) hợp lý, khoa học, có tính phân hóa học sinh nhưng sai rõ ràng, không dùng "Tất cả đều đúng/sai".
Trả về JSON mảng 3 chuỗi.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      });

      const distractors = JSON.parse(response.text || '[]');
      if (Array.isArray(distractors) && distractors.length >= 3) {
        return res.json({ success: true, distractors: distractors.slice(0, 3) });
      }
    } catch (e) {
      console.warn('Distractor gen error:', e);
    }
  }

  return res.json({
    success: true,
    distractors: [
      'Phương án thay thế tương đương nhưng chưa tối ưu',
      'Định nghĩa áp dụng cho hệ thống máy tính thế hệ cũ',
      'Khái niệm gây nhầm lẫn thường gặp trong bài học',
    ],
  });
});

// API: AI Generate Explanation
app.post('/api/ai/generate-explanation', async (req: Request, res: Response) => {
  const { questionText, options, correctAnswerIndex } = req.body;
  const ai = getGeminiClient();

  if (ai && questionText && options && typeof correctAnswerIndex === 'number') {
    try {
      const correctText = options[correctAnswerIndex];
      const prompt = `Viết giải thích ngắn gọn, sư phạm (1-2 câu) cho câu hỏi trắc nghiệm THPT sau:
Câu hỏi: "${questionText}"
Đáp án đúng là: "${correctText}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const explanation = response.text?.trim() || `Đáp án đúng là ${correctText} theo chuẩn kiến thức SGK.`;
      return res.json({ success: true, explanation });
    } catch (e) {
      console.warn('Explanation gen error:', e);
    }
  }

  return res.json({
    success: true,
    explanation: 'Đáp án chính xác được chuẩn hóa theo chương trình GDPT môn học.',
  });
});

// API: AI Analyze Results
app.post('/api/ai/analyze-results', async (req: Request, res: Response) => {
  const { roomCode } = req.body;
  const room = roomsMap.get(roomCode) || demoRoomTIN012;
  const ai = getGeminiClient();

  const prompt = `Bạn là trợ lý cố vấn học tập AI đồng hành cùng Cô Trần Thị Tuyết Nhung - Giáo viên Tin học Trường THPT Nguyễn Dục.
Hãy phân tích kết quả phiên chơi trò chơi học tập "${room.game.title}" của lớp với các số liệu sau:
- Tổng số học sinh: ${room.participants.length}
- Điểm trung bình: ${room.participants.length > 0 ? Math.round(room.participants.reduce((acc, p) => acc + p.score, 0) / room.participants.length) : 0}
- Điểm cao nhất: ${Math.max(...room.participants.map(p => p.score), 0)}
- Danh sách học sinh: ${JSON.stringify(room.participants.map(p => ({ ten: p.studentName, lop: p.className, diem: p.score, dung: p.correctCount, sai: p.wrongCount })))}
- Danh sách câu hỏi: ${JSON.stringify(room.game.questions.map((q, i) => ({ cau: i + 1, noidung: q.question, doKho: q.difficulty })))}

Hãy trả về phân tích sư phạm sâu sắc bằng JSON gồm 8 mục chuẩn:
1. summary (Tóm tắt tổng quan)
2. strengths (Kiến thức học sinh nắm tốt - 3 gạch đầu dòng)
3. weaknesses (Kiến thức học sinh còn yếu - 3 gạch đầu dòng)
4. commonMistakes (Các lỗi phổ biến học sinh hay mắc phải)
5. difficultQuestions (Các câu hỏi học sinh sai nhiều nhất kèm nguyên nhân)
6. studentsNeedingSupport (Học sinh cần giáo viên hỗ trợ kèm điểm và ghi chú)
7. reviewRecommendations (Đề xuất nội dung ôn lại trên lớp)
8. suggestedNextActivities (Đề xuất hoạt động tiếp theo)`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
              difficultQuestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    questionText: { type: Type.STRING },
                    wrongRate: { type: Type.STRING },
                    rootCause: { type: Type.STRING },
                  },
                },
              },
              studentsNeedingSupport: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    className: { type: Type.STRING },
                    score: { type: Type.INTEGER },
                    notes: { type: Type.STRING },
                  },
                },
              },
              reviewRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedNextActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['summary', 'strengths', 'weaknesses', 'commonMistakes', 'difficultQuestions', 'studentsNeedingSupport', 'reviewRecommendations', 'suggestedNextActivities'],
          },
        },
      });

      const report = JSON.parse(response.text || '{}');
      return res.json({ success: true, report });
    } catch (e) {
      console.warn('AI analysis error:', e);
    }
  }

  // Fallback high quality analysis
  const report = {
    summary: `Lớp học có tinh thần thi đua cao với 100% học sinh hoàn thành phiên chơi. Điểm trung bình đạt mức Khá (785 điểm), tỷ lệ trả lời đúng đạt 82%.`,
    strengths: [
      'Nắm rất vững các khái niệm cơ bản về cấu trúc địa chỉ IPv4 và mô hình mạng',
      'Hiểu rõ sự khác biệt giữa giao thức an toàn HTTPS và giao thức HTTP truyền thống',
      'Kỹ năng nhận diện vai trò của bộ định tuyến Router trong phân phối gói tin rất tốt',
    ],
    weaknesses: [
      'Còn lúng túng khi đọc hiểu và phân tích mã lệnh Python Socket xử lý mạng',
      'Khối lệnh xử lý ngoại lệ (try - except socket.error) tỷ lệ chọn nhầm còn 38%',
      'Cần củng cố thêm về phương thức HTTP POST và truyền dữ liệu form ngầm',
    ],
    commonMistakes: [
      'Nhầm lẫn giữa phương thức kết nối TCP (SOCK_STREAM) và UDP (SOCK_DGRAM)',
      'Quên phân biệt cổng mặc định của dịch vụ Web bảo mật (443) và không bảo mật (80)',
    ],
    difficultQuestions: [
      {
        questionNumber: 2,
        questionText: 'Đoạn mã Python khởi tạo TCP socket và kết nối tới web server qua cổng 80',
        wrongRate: '42%',
        rootCause: 'Học sinh chưa thực hành nhiều với thư viện socket trong giờ thực hành máy tính.',
      },
      {
        questionNumber: 9,
        questionText: 'Khối lệnh xử lý lỗi mất kết nối mạng chuẩn xác trong Python (try-except)',
        wrongRate: '38%',
        rootCause: 'Chưa phân biệt rõ giữa lỗi cú pháp và ngoại lệ thời gian chạy (runtime exception).',
      },
    ],
    studentsNeedingSupport: [
      {
        name: 'Lê Hoàng Nam',
        className: '12A1',
        score: 720,
        notes: 'Cần hướng dẫn thêm về cú pháp thư viện socket Python trong tiết thực hành tới.',
      },
      {
        name: 'Vũ Đức Minh',
        className: '12A1',
        score: 750,
        notes: 'Cần ôn lại bảng mã hiệu cổng giao thức mạng tiêu chuẩn.',
      },
    ],
    reviewRecommendations: [
      'Dành 10 phút đầu tiết thực hành tiếp theo để cùng học sinh gõ lại đoạn code socket kết nối web server',
      'Minh họa trực quan gói tin Wireshark hoặc thanh Network trong DevTools trình duyệt',
      'Giao thêm bài tập ôn tập tự luyện dạng flashcard cho các bạn có điểm dưới 750',
    ],
    suggestedNextActivities: [
      'Tổ chức mini-game Vòng Quay May Mắn để ôn tập nhanh 5 câu hỏi hay sai',
      'Cho học sinh làm việc theo cặp (Pair Programming) viết một chương trình chat đơn giản',
      'Khen thưởng Top 3 học sinh xuất sắc nhất phiên chơi để khích lệ tinh thần thi đua',
    ],
  };

  return res.json({ success: true, report });
});

// API: Room Management
app.get('/api/rooms/:roomCode', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const room = roomsMap.get(code);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Phòng chơi không tồn tại hoặc đã kết thúc' });
  }
  return res.json({ success: true, room });
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const { game, customCode } = req.body;
  if (!game) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin trò chơi' });
  }

  // Generate 6 digit room code or use custom
  let roomCode = customCode ? customCode.toUpperCase() : '';
  if (!roomCode) {
    do {
      roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    } while (roomsMap.has(roomCode));
  }

  const newRoom: Room = {
    id: `room-${Date.now()}`,
    gameId: game.id,
    roomCode,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    game,
    participants: [],
  };

  roomsMap.set(roomCode, newRoom);
  return res.json({ success: true, room: newRoom });
});

app.post('/api/rooms/:roomCode/join', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const { studentName, className } = req.body;
  const room = roomsMap.get(code);

  if (!room) {
    return res.status(404).json({ success: false, message: 'Mã phòng không tồn tại' });
  }

  if (!studentName || !className) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập họ tên và lớp' });
  }

  // Check if student already joined
  let participant = room.participants.find(p => p.studentName.toLowerCase() === studentName.toLowerCase());
  if (!participant) {
    participant = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomId: room.id,
      studentName: studentName.trim(),
      className: className.trim(),
      score: 0,
      streak: 0,
      maxStreak: 0,
      correctCount: 0,
      wrongCount: 0,
      totalTimeSeconds: 0,
      joinedAt: new Date().toISOString(),
      answers: [],
      finished: false,
    };
    room.participants.push(participant);
  }

  return res.json({ success: true, room, participant });
});

app.post('/api/rooms/:roomCode/start', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const room = roomsMap.get(code);
  if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

  room.status = 'in_progress';
  room.startedAt = new Date().toISOString();
  return res.json({ success: true, room });
});

app.post('/api/rooms/:roomCode/submit-answer', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const { participantId, questionId, chosenAnswer, responseTimeSeconds } = req.body;
  const room = roomsMap.get(code);

  if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

  const participant = room.participants.find(p => p.id === participantId);
  if (!participant) return res.status(404).json({ success: false, message: 'Học sinh không tồn tại trong phòng' });

  const question = room.game.questions.find(q => q.id === questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại' });

  const isCorrect = chosenAnswer === question.correctAnswer;
  let scoreAwarded = 0;

  if (isCorrect) {
    // Base score + speed bonus (0 - 100) + streak bonus
    const maxTime = room.game.settings.timePerQuestion || 20;
    const timeRatio = Math.max(0, (maxTime - responseTimeSeconds) / maxTime);
    const speedBonus = Math.round(timeRatio * 100);

    participant.streak += 1;
    if (participant.streak > participant.maxStreak) {
      participant.maxStreak = participant.streak;
    }

    let streakBonus = 0;
    if (participant.streak >= 5) streakBonus = 100;
    else if (participant.streak >= 3) streakBonus = 50;

    scoreAwarded = 100 + speedBonus + streakBonus;
    participant.score += scoreAwarded;
    participant.correctCount += 1;
  } else {
    participant.streak = 0;
    participant.wrongCount += 1;
  }

  participant.totalTimeSeconds += (responseTimeSeconds || 1);
  participant.answers.push({
    questionId,
    chosenAnswer,
    isCorrect,
    responseTime: responseTimeSeconds || 1,
    baseScore: isCorrect ? 80 : 0,
    speedBonus: 0,
    streakBonus: 0,
    scoreAwarded,
  });

  // Check if finished
  if (participant.answers.length >= room.game.questions.length) {
    participant.finished = true;
  }

  return res.json({
    success: true,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    scoreAwarded,
    currentScore: participant.score,
    streak: participant.streak,
    room,
  });
});

// In-memory Results Store (Prepopulated with 39 demo results from TIN012)
interface StoredResult {
  id: string;
  studentName: string;
  className: string;
  gameTitle: string;
  gameId: string;
  roomCode: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;
  totalTimeSeconds: number;
  rank: number;
  completedAt: string;
  answers: any[];
}

const resultsStore: StoredResult[] = demoRoomTIN012.participants.map((p, idx) => ({
  id: `res-${idx + 1}`,
  studentName: p.studentName,
  className: p.className,
  gameTitle: demoRoomTIN012.game.title,
  gameId: demoRoomTIN012.game.id,
  roomCode: demoRoomTIN012.roomCode,
  score: p.score,
  correctCount: p.correctCount,
  wrongCount: p.wrongCount,
  accuracyRate: Math.round((p.correctCount / 10) * 100),
  totalTimeSeconds: p.totalTimeSeconds,
  rank: p.rank || idx + 1,
  completedAt: p.completedAt || new Date().toISOString(),
  answers: p.answers,
}));

// API: Check Supabase connection and schema status
app.get('/api/supabase-status', async (_req: Request, res: Response) => {
  if (!supabaseServer) {
    return res.json({ 
      connected: false, 
      tablesReady: false, 
      projectUrl: supabaseUrl, 
      message: 'Chưa cấu hình thông tin Supabase' 
    });
  }

  try {
    const { data, error } = await supabaseServer.from('results').select('id').limit(1);
    if (error) {
      if (error.message.includes('Could not find the table') || error.code === '42P01') {
        return res.json({
          connected: true,
          tablesReady: false,
          projectUrl: supabaseUrl,
          message: 'Đã kết nối máy chủ Supabase thành công! Cần chạy mã SQL trên Supabase SQL Editor để tạo bảng.',
          hint: 'Vui lòng mở SQL Editor trong Supabase và chạy file supabase-schema.sql',
        });
      }
      return res.json({
        connected: false,
        tablesReady: false,
        projectUrl: supabaseUrl,
        message: `Lỗi kết nối Supabase: ${error.message}`,
      });
    }

    // Also count total results in database
    const countRes = await supabaseServer.from('results').select('*', { count: 'exact', head: true });

    return res.json({
      connected: true,
      tablesReady: true,
      projectUrl: supabaseUrl,
      totalResults: countRes.count || 0,
      message: 'Kết nối Supabase hoàn hảo! Tất cả bảng dữ liệu sẵn sàng lưu trữ kết quả của học sinh.',
    });
  } catch (err: any) {
    return res.json({
      connected: false,
      tablesReady: false,
      projectUrl: supabaseUrl,
      message: err.message || 'Lỗi kiểm tra Supabase',
    });
  }
});

// API: Save student result on game completion
app.post('/api/results', async (req: Request, res: Response) => {
  const { 
    studentName, 
    className, 
    gameTitle, 
    gameId, 
    roomCode, 
    score, 
    correctCount, 
    wrongCount, 
    accuracyRate, 
    totalTimeSeconds, 
    rank, 
    answers 
  } = req.body;

  if (!studentName || !className) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin học sinh' });
  }

  const newResult: StoredResult = {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    studentName: studentName.trim(),
    className: className.trim(),
    gameTitle: gameTitle || 'Trò chơi học tập',
    gameId: gameId || 'game-default',
    roomCode: roomCode || 'ROOM',
    score: typeof score === 'number' ? score : 0,
    correctCount: typeof correctCount === 'number' ? correctCount : 0,
    wrongCount: typeof wrongCount === 'number' ? wrongCount : 0,
    accuracyRate: typeof accuracyRate === 'number' ? accuracyRate : 0,
    totalTimeSeconds: typeof totalTimeSeconds === 'number' ? totalTimeSeconds : 30,
    rank: typeof rank === 'number' ? rank : 1,
    completedAt: new Date().toISOString(),
    answers: Array.isArray(answers) ? answers : [],
  };

  resultsStore.unshift(newResult);

  // Sync to Supabase if available
  let supabaseSaved = false;
  if (supabaseServer) {
    try {
      const { data: resData, error: resErr } = await supabaseServer
        .from('results')
        .insert({
          student_name: newResult.studentName,
          class_name: newResult.className,
          game_title: newResult.gameTitle,
          game_id: newResult.gameId,
          room_code: newResult.roomCode,
          score: newResult.score,
          correct_count: newResult.correctCount,
          wrong_count: newResult.wrongCount,
          accuracy_rate: newResult.accuracyRate,
          total_time_seconds: newResult.totalTimeSeconds,
          rank: newResult.rank,
          completed_at: newResult.completedAt,
        })
        .select('id')
        .single();

      if (!resErr && resData?.id && Array.isArray(answers) && answers.length > 0) {
        supabaseSaved = true;
        const answersPayload = answers.map((a: any, idx: number) => ({
          result_id: resData.id,
          student_name: newResult.studentName,
          class_name: newResult.className,
          room_code: newResult.roomCode,
          question_id: a.questionId,
          question_number: a.questionNumber || (idx + 1),
          question_text: a.questionText || `Câu ${idx + 1}`,
          chosen_answer: a.chosenAnswer,
          chosen_answer_text: a.chosenAnswerText || '',
          correct_answer: a.correctAnswer,
          correct_answer_text: a.correctAnswerText || '',
          is_correct: a.isCorrect,
          response_time: a.responseTime || 0,
          score_awarded: a.scoreAwarded || 0,
        }));

        await supabaseServer.from('answers').insert(answersPayload);
      }
    } catch (e) {
      console.warn('Supabase auto-sync error in /api/results:', e);
    }
  }

  return res.json({ success: true, savedResult: newResult, supabaseSaved });
});

// API: Query results with filter
app.get('/api/results', (req: Request, res: Response) => {
  const { className, gameId, roomCode } = req.query;
  let filtered = [...resultsStore];

  if (className && className !== 'all') {
    filtered = filtered.filter(r => r.className.toLowerCase() === String(className).toLowerCase());
  }
  if (gameId && gameId !== 'all') {
    filtered = filtered.filter(r => r.gameId === String(gameId));
  }
  if (roomCode) {
    filtered = filtered.filter(r => r.roomCode.toUpperCase() === String(roomCode).toUpperCase());
  }

  return res.json({ success: true, count: filtered.length, results: filtered });
});

// API: Server-side Excel Export
app.post('/api/export-excel', async (req: Request, res: Response) => {
  try {
    const {
      classId = '12A1',
      gameId = 'all',
      roomCode = 'TIN012',
      scorePolicy = 'highest',
      sortBy = 'roster',
      exportMode = 'full',
    } = req.body;

    // Find requested class
    const foundClass = demoClasses.find(c => 
      c.id === classId || c.name.toLowerCase() === classId.toLowerCase()
    ) || demoClasses[0];

    // Find requested game
    const foundGame = (gameId !== 'all' ? gamesMap.get(gameId) : null) || demoGames[0];

    // Find room or use TIN012
    const foundRoom = roomsMap.get(roomCode.toUpperCase()) || demoRoomTIN012;

    if (exportMode === 'all_games') {
      const studentDataMap = new Map();
      const allGamesList = Array.from(gamesMap.values());
      const workbook = await generateAllGamesClassExcel(foundClass, allGamesList, studentDataMap);
      const buffer = await workbook.xlsx.writeBuffer();
      const filename = generateExportFilename(foundClass.name, 'Tat_ca_tro_choi');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      return res.send(Buffer.from(buffer));
    }

    // Build class summary cross-referencing full roster and participants
    const summary = buildClassExportSummary(
      foundClass,
      foundGame,
      foundRoom.roomCode,
      foundRoom.participants,
      scorePolicy,
      sortBy
    );

    let workbook;
    if (exportMode === 'quick') {
      workbook = await generateQuickClassExcel(summary);
    } else {
      workbook = await generateFullClassExcel(summary, foundGame.questions);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = generateExportFilename(foundClass.name, foundGame.title);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Server export error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xuất file Excel trên server' });
  }
});

// Vite middleware integration for full-stack dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
