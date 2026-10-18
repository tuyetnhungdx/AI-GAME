import { GoogleGenAI, Type } from '@google/genai';
import type { Question } from '../types';

export interface GenerateQuestionsParams {
  subject?: string;
  grade?: string;
  book?: string;
  textbook?: string;
  lesson?: string;
  lessonTitle?: string;
  content?: string;
  questionCount?: number | string;
  count?: number | string;
  difficultyDistribution?: string;
}

export interface GenerateQuestionsResult {
  status: number;
  success: boolean;
  questions?: Question[];
  count?: number;
  error?: string;
  details?: any;
}

export async function generateQuestionsWithGemini(
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResult> {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

  // 1. Kiểm tra biến môi trường GEMINI_API_KEY / GOOGLE_API_KEY
  if (!apiKey) {
    console.error('[API generate-questions ERROR]: Thiếu GEMINI_API_KEY trong biến môi trường server');
    return {
      status: 500,
      success: false,
      error: 'Thiếu GEMINI_API_KEY',
    };
  }

  // 2. Chuẩn hóa và kiểm tra dữ liệu đầu vào
  const subject = (params.subject || 'Tin học').trim();
  const grade = (params.grade || '12').trim();
  const book = (params.book || params.textbook || 'Kết nối tri thức').trim();
  const lesson = (params.lesson || params.lessonTitle || '').trim();
  const content = (params.content || '').trim();
  const rawCount = Number(params.questionCount || params.count || 15);
  const questionCount = isNaN(rawCount) || rawCount <= 0 ? 15 : Math.min(Math.max(rawCount, 1), 50);
  const difficultyDistribution = (
    params.difficultyDistribution || '30% nhận biết, 40% thông hiểu, 30% vận dụng'
  ).trim();

  if (!subject) {
    console.error('[API generate-questions ERROR]: Thiếu thông tin môn học (subject)');
    return {
      status: 400,
      success: false,
      error: 'Thiếu thông tin môn học (subject)',
    };
  }

  if (!lesson) {
    console.error('[API generate-questions ERROR]: Thiếu thông tin tên bài học (lesson)');
    return {
      status: 400,
      success: false,
      error: 'Thiếu thông tin tên bài học (lesson)',
    };
  }

  // 3. Khởi tạo GoogleGenAI SDK
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-edtech',
      },
    },
  });

  const prompt = `Bạn là chuyên gia sư phạm THPT Việt Nam và giáo viên bộ môn ${subject} giỏi.
Hãy tạo ĐÚNG ${questionCount} câu hỏi trắc nghiệm khách quan 4 lựa chọn (A, B, C, D) cho học sinh lớp ${grade}, môn ${subject}, sách giáo khoa "${book}", bài học/chủ đề: "${lesson}".

Nội dung kiến thức trọng tâm được cung cấp:
"""
${content || `Kiến thức chuẩn chương trình giáo dục phổ thông THPT 2018 môn ${subject} lớp ${grade}: ${lesson}`}
"""

YÊU CẦU BẮT BUỘC:
1. Số lượng câu hỏi: Tạo ĐỦ ${questionCount} câu hỏi chất lượng cao.
2. Phân bố mức độ: Bám sát tỉ lệ "${difficultyDistribution}" (ví dụ: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao).
3. Mỗi câu hỏi gồm:
   - "question": Nội dung câu hỏi rõ ràng, chính xác khoa học theo chuẩn SGK ${book}.
   - "options": Mảng ĐÚNG 4 phương án lựa chọn phân biệt (tương ứng A, B, C, D). Không tạo phương án kiểu "Cả A và B đều đúng" hoặc "Tất cả đều sai".
   - "correctAnswer": Số nguyên từ 0 đến 3 chỉ số đáp án đúng (0 là A, 1 là B, 2 là C, 3 là D).
   - "explanation": Lời giải thích ngắn gọn, súc tích (1-2 câu) vì sao đáp án đó đúng.
   - "difficulty": Thuộc một trong 4 mức: "Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao".
   - "topic": Chủ đề kiến thức hoặc tên bài học.
   - Nếu môn là "Tin học" hoặc bài có code, hãy tạo đoạn code thực tế (Python, SQL, HTML, C++) trong "codeSnippet" và ngôn ngữ trong "codeLanguage".
4. ĐỊNH DẠNG: Chỉ trả về JSON thuần, TUYỆT ĐỐI KHÔNG chứa markdown (\`\`\`json).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Bạn là chuyên gia khảo thí và sư phạm giáo dục phổ thông Việt Nam. Hãy trả về JSON thuần chuẩn xác theo schema, không bọc markdown.',
        thinkingConfig: {
          thinkingBudget: 0,
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: `Danh sách ${questionCount} câu hỏi trắc nghiệm khách quan`,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: 'Nội dung câu hỏi' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Mảng đúng 4 lựa chọn A, B, C, D',
              },
              correctAnswer: {
                type: Type.INTEGER,
                description: 'Chỉ số phương án đúng từ 0 đến 3',
              },
              explanation: {
                type: Type.STRING,
                description: 'Giải thích ngắn gọn vì sao đáp án đúng',
              },
              difficulty: {
                type: Type.STRING,
                description: 'Mức độ: Nhận biết, Thông hiểu, Vận dụng, hoặc Vận dụng cao',
              },
              topic: { type: Type.STRING, description: 'Chủ đề kiến thức' },
              codeSnippet: { type: Type.STRING, description: 'Đoạn mã code thực tế nếu có' },
              codeLanguage: { type: Type.STRING, description: 'Ngôn ngữ lập trình: python, sql, html, cpp' },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'difficulty'],
          },
        },
      },
    });

    const rawText = response.text || '';
    if (!rawText.trim()) {
      console.error('[API generate-questions ERROR]: AI trả về phản hồi rỗng');
      return {
        status: 500,
        success: false,
        error: 'AI trả dữ liệu không hợp lệ',
      };
    }

    // Parse JSON
    let parsed: any[];
    try {
      // Clean possible markdown wrappers if any
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[API generate-questions ERROR]: Lỗi parse JSON từ Gemini:', parseErr, 'Raw text:', rawText);
      return {
        status: 500,
        success: false,
        error: 'AI trả dữ liệu không hợp lệ',
      };
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error('[API generate-questions ERROR]: Kết quả parse không phải là mảng hoặc mảng rỗng');
      return {
        status: 500,
        success: false,
        error: 'AI trả dữ liệu không hợp lệ',
      };
    }

    // Validate và format từng câu hỏi
    const validatedQuestions: Question[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item || typeof item.question !== 'string' || !item.question.trim()) {
        continue;
      }

      // Check options
      let opts: string[] = [];
      if (Array.isArray(item.options) && item.options.length >= 4) {
        opts = item.options.slice(0, 4).map((o: any) => String(o || '').trim());
      } else if (Array.isArray(item.options) && item.options.length > 0) {
        opts = [...item.options.map((o: any) => String(o || '').trim())];
        while (opts.length < 4) {
          opts.push(`Phương án ${String.fromCharCode(65 + opts.length)}`);
        }
      } else {
        opts = ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'];
      }

      let correct = typeof item.correctAnswer === 'number' ? item.correctAnswer : 0;
      if (correct < 0 || correct > 3) correct = 0;

      validatedQuestions.push({
        id: `ai-q-${Date.now()}-${i + 1}`,
        question: item.question.trim(),
        options: opts,
        correctAnswer: correct,
        explanation: item.explanation?.trim() || 'Đáp án đúng theo chuẩn SGK.',
        difficulty: (item.difficulty || 'Thông hiểu') as any,
        topic: item.topic?.trim() || lesson,
        codeSnippet: item.codeSnippet?.trim() || undefined,
        codeLanguage: item.codeLanguage?.trim() || (subject === 'Tin học' ? 'python' : undefined),
      });
    }

    if (validatedQuestions.length === 0) {
      console.error('[API generate-questions ERROR]: Không có câu hỏi nào hợp lệ sau khi validate');
      return {
        status: 500,
        success: false,
        error: 'AI trả dữ liệu không hợp lệ',
      };
    }

    return {
      status: 200,
      success: true,
      questions: validatedQuestions,
      count: validatedQuestions.length,
    };
  } catch (error: any) {
    console.error('[API generate-questions ERROR]:', error);

    const errorMessage = error?.message || String(error);
    const errorStatus = error?.status || error?.statusCode || error?.code;

    // Phân loại mã lỗi chính xác
    if (errorStatus === 401 || errorStatus === 403 || /api[ _-]?key|unauthorized|forbidden|credentials/i.test(errorMessage)) {
      return {
        status: 401,
        success: false,
        error: 'API key Gemini chưa được cấu hình hoặc không hợp lệ',
        details: errorMessage,
      };
    }

    if (errorStatus === 429 || /quota|rate[ _-]?limit|resource[ _-]?exhausted/i.test(errorMessage)) {
      return {
        status: 429,
        success: false,
        error: 'Đã hết hạn mức Gemini (Quota exceeded). Vui lòng thử lại sau giây lát.',
        details: errorMessage,
      };
    }

    if (errorStatus === 400 || /invalid[ _-]?argument|bad[ _-]?request/i.test(errorMessage)) {
      return {
        status: 400,
        success: false,
        error: 'Yêu cầu không hợp lệ hoặc nội dung vi phạm chính sách của Gemini',
        details: errorMessage,
      };
    }

    if (errorStatus === 404 || /not[ _-]?found/i.test(errorMessage)) {
      return {
        status: 404,
        success: false,
        error: 'Không tìm thấy API tạo câu hỏi',
        details: errorMessage,
      };
    }

    return {
      status: 500,
      success: false,
      error: `Lỗi máy chủ AI Gemini: ${errorMessage}`,
      details: errorMessage,
    };
  }
}
