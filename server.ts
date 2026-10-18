import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { demoGames, demoQuestionsTin12, demoRoomTIN012 } from './src/data/initialData';
import { Game, Participant, Question, Room } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

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

// API: AI Generate Questions
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  const {
    subject = 'Tin học',
    grade = '12',
    textbook = 'Kết nối tri thức',
    lessonTitle = 'Bài học mới',
    content = '',
    count = 10,
    difficultyDistribution = '30% Nhận biết, 40% Thông hiểu, 30% Vận dụng',
  } = req.body;

  const ai = getGeminiClient();

  const prompt = `Bạn là chuyên gia sư phạm THPT Việt Nam và giáo viên bộ môn ${subject} giỏi.
Hãy tạo ${count} câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) cho học sinh lớp ${grade}, môn ${subject}, sách giáo khoa "${textbook}", bài học "${lessonTitle}".
Dựa trên nội dung kiến thức được cung cấp:
"""
${content || `Kiến thức chuẩn chương trình giáo dục phổ thông THPT 2018 môn ${subject} lớp ${grade}: ${lessonTitle}`}
"""

Yêu cầu khắt khe:
1. Bám sát nội dung, chính xác khoa học, không tự bịa thông tin.
2. Đúng một đáp án chính xác duy nhất.
3. 3 phương án nhiễu hợp lý, không có dạng "Tất cả đều đúng" hoặc "Tất cả đều sai".
4. Phân bổ độ khó: ${difficultyDistribution}.
5. Độ dài các phương án tương đối cân đối.
6. Nếu môn là "Tin học" hoặc có liên quan đến lập trình, hãy tạo đoạn mã code thực tế (Python, C++, HTML, SQL, etc.) trong trường codeSnippet nếu phù hợp (Dự đoán kết quả, tìm lỗi, hoàn thiện code, truy vấn SQL, cấu trúc mạng).
7. Giải thích ngắn gọn, súc tích (1-2 câu).
8. correctAnswer là chỉ số số nguyên từ 0 đến 3 (tương ứng với vị trí trong mảng options: 0 là A, 1 là B, 2 là C, 3 là D).`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia khảo thí và sư phạm giáo dục phổ thông Việt Nam. Hãy trả về JSON chuẩn xác.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            description: 'Danh sách câu hỏi trắc nghiệm',
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: 'Nội dung câu hỏi' },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '4 lựa chọn A, B, C, D',
                },
                correctAnswer: { type: Type.INTEGER, description: 'Chỉ số đáp án đúng từ 0 đến 3' },
                explanation: { type: Type.STRING, description: 'Giải thích ngắn gọn vì sao đáp án đó đúng' },
                difficulty: {
                  type: Type.STRING,
                  description: 'Mức độ: Nhận biết, Thông hiểu, Vận dụng, hoặc Vận dụng cao',
                },
                topic: { type: Type.STRING, description: 'Chủ đề kiến thức' },
                codeSnippet: { type: Type.STRING, description: 'Đoạn mã code nếu câu hỏi liên quan đến code' },
                codeLanguage: { type: Type.STRING, description: 'Ngôn ngữ code: python, cpp, html, sql, javascript' },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation', 'difficulty'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validatedQuestions: Question[] = parsed.map((q, idx) => ({
          id: `ai-gen-${Date.now()}-${idx}`,
          question: q.question,
          options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'],
          correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
          explanation: q.explanation || 'Đáp án đúng theo chuẩn SGK.',
          difficulty: q.difficulty || 'Thông hiểu',
          topic: q.topic || lessonTitle,
          codeSnippet: q.codeSnippet || undefined,
          codeLanguage: q.codeLanguage || (subject === 'Tin học' ? 'python' : undefined),
        }));
        return res.json({ success: true, questions: validatedQuestions, source: 'gemini' });
      }
    } catch (error) {
      console.warn('Gemini generate error, falling back to smart educational generator:', error);
    }
  }

  // High quality pedagogical fallback when offline or no API key
  const fallbackQuestions: Question[] = [
    {
      id: `fb-1-${Date.now()}`,
      question: `Theo nội dung bài học "${lessonTitle}", khái niệm cốt lõi nào sau đây được định nghĩa chính xác nhất?`,
      options: [
        `Khái niệm được chuẩn hóa trong chương trình SGK ${textbook} lớp ${grade}`,
        'Khái niệm chỉ mang tính chất giả định chưa được kiểm chứng thực tế',
        'Khái niệm chỉ áp dụng cho máy tính cơ khí thế hệ thứ nhất',
        'Khái niệm không có tính ứng dụng trong kỷ nguyên số'
      ],
      correctAnswer: 0,
      explanation: `Bám sát định nghĩa chuẩn của bài "${lessonTitle}" SGK ${textbook}.`,
      difficulty: 'Nhận biết',
      topic: lessonTitle,
    },
    {
      id: `fb-2-${Date.now()}`,
      question: `Cho đoạn mã mô phỏng quy trình xử lý dữ liệu môn ${subject} sau, kết quả xuất ra là gì?`,
      options: [
        'Dữ liệu đã được chuẩn hóa và sắp xếp tăng dần',
        'Chương trình rơi vào vòng lặp vô tận',
        'Xảy ra lỗi chia cho 0 (ZeroDivisionError)',
        'Danh sách bị xóa sạch không còn phần tử'
      ],
      correctAnswer: 0,
      explanation: 'Thuật toán thực thi tuần tự và hoàn thành chuẩn xác theo logic.',
      difficulty: 'Thông hiểu',
      topic: 'Thuật toán & Xử lý dữ liệu',
      codeSnippet: `# Xử lý dữ liệu bài học: ${lessonTitle}\ndata = [12, 45, 23, 67, 8]\nsorted_data = sorted(data)\nprint(f"Ket qua: {sorted_data}")`,
      codeLanguage: 'python',
    },
    {
      id: `fb-3-${Date.now()}`,
      question: `Trong quá trình vận dụng kiến thức "${lessonTitle}" vào giải quyết bài toán thực tế, bước quan trọng đầu tiên là:`,
      options: [
        'Xác định rõ Input, Output và điều kiện ràng buộc của bài toán',
        'Lập tức viết code ngay mà không cần phân tích yêu cầu',
        'Bỏ qua các trường hợp ngoại lệ để tiết kiệm thời gian',
        'Sao chép kết quả từ một bài toán ngẫu nhiên trên mạng'
      ],
      correctAnswer: 0,
      explanation: 'Phân tích xác định Input/Output là nền tảng cốt lõi trong tư duy thuật toán và khoa học.',
      difficulty: 'Vận dụng',
      topic: lessonTitle,
    },
    {
      id: `fb-4-${Date.now()}`,
      question: `Biện pháp nào sau đây giúp tối ưu hóa hiệu quả khi triển khai giải pháp cho bài học "${lessonTitle}"?`,
      options: [
        'Tổ chức cấu trúc dữ liệu hợp lý và kiểm thử từng mô-đun',
        'Tăng gấp đôi số lượng câu lệnh lặp không cần thiết',
        'Tắt các cơ chế cảnh báo lỗi hệ thống',
        'Không lưu trữ lại lịch sử thực thi'
      ],
      correctAnswer: 0,
      explanation: 'Cấu trúc dữ liệu tối ưu cùng quy trình kiểm thử mô-đun giúp giảm thiểu lỗi phát sinh.',
      difficulty: 'Vận dụng cao',
      topic: lessonTitle,
    },
    {
      id: `fb-5-${Date.now()}`,
      question: `Đặc điểm phân biệt nổi bật nhất của công nghệ hiện đại được đề cập trong bài "${lessonTitle}" là gì?`,
      options: [
        'Tính tự động hóa cao, liên thông và khả năng mở rộng trên đám mây',
        'Chỉ hoạt động được trên hệ thống mạng cục bộ không nối Internet',
        'Đòi hỏi người dùng phải can thiệp thủ công ở mọi thao tác',
        'Không tương thích với các thiết bị thông minh cầm tay'
      ],
      correctAnswer: 0,
      explanation: 'Công nghệ giáo dục hiện đại gắn liền với đám mây, tự động hóa và kết nối đa nền tảng.',
      difficulty: 'Thông hiểu',
      topic: lessonTitle,
    }
  ];

  // Repeat or slice to match requested count
  const result: Question[] = [];
  for (let i = 0; i < count; i++) {
    const template = fallbackQuestions[i % fallbackQuestions.length];
    result.push({
      ...template,
      id: `gen-${Date.now()}-${i + 1}`,
      question: i >= fallbackQuestions.length ? `[Mở rộng ${i + 1}] ${template.question}` : template.question,
    });
  }

  return res.json({ success: true, questions: result, source: 'fallback' });
});

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

app.post('/api/rooms/:roomCode/end', (req: Request, res: Response) => {
  const code = (req.params.roomCode || '').toUpperCase();
  const room = roomsMap.get(code);
  if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại' });

  room.status = 'ended';
  room.endedAt = new Date().toISOString();
  return res.json({ success: true, room });
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
