import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI, Type } from '@google/genai';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (statusCode: number) => VercelResponse;
  json: (data: any) => VercelResponse;
  send: (data: any) => VercelResponse;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  topic?: string;
  codeSnippet?: string;
  codeLanguage?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).json({ ok: true });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Phương thức không được hỗ trợ. Vui lòng gửi yêu cầu POST.',
    });
    return;
  }

  // 2. Kiểm tra GEMINI_API_KEY
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!apiKey) {
    console.error('[Vercel API generate-questions ERROR]: Thiếu GEMINI_API_KEY trong biến môi trường server');
    res.status(500).json({
      success: false,
      error: 'Thiếu GEMINI_API_KEY',
    });
    return;
  }

  try {
    // 3. Parse and sanitize input body
    let body: any = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch {
        body = {};
      }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    const subject = (body.subject || 'Tin học').trim();
    const grade = (body.grade || '12').trim();
    const book = (body.book || body.textbook || 'Kết nối tri thức').trim();
    const lesson = (body.lesson || body.lessonTitle || 'Ôn tập kiến thức').trim();
    const content = (body.content || '').trim();
    const rawCount = Number(body.questionCount || body.count || 10);
    const questionCount = isNaN(rawCount) || rawCount <= 0 ? 10 : Math.min(Math.max(rawCount, 1), 50);
    const difficultyDistribution = (
      body.difficultyDistribution || '30% nhận biết, 40% thông hiểu, 30% vận dụng'
    ).trim();

    if (!subject) {
      console.error('[Vercel API generate-questions ERROR]: Thiếu môn học (subject)');
      res.status(400).json({ success: false, error: 'Thiếu thông tin môn học (subject)' });
      return;
    }

    if (!lesson && !content) {
      console.error('[Vercel API generate-questions ERROR]: Thiếu tên bài hoặc nội dung kiến thức');
      res.status(400).json({ success: false, error: 'Thiếu thông tin tên bài học hoặc nội dung kiến thức' });
      return;
    }

    // 4. Initialize GoogleGenAI SDK
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

Nội dung kiến thức trọng tâm:
"""
${content || `Kiến thức chuẩn chương trình GDPT 2018 môn ${subject} lớp ${grade}: ${lesson}`}
"""

YÊU CẦU BẮT BUỘC:
1. Số lượng câu hỏi: Tạo ĐỦ ${questionCount} câu hỏi chất lượng cao.
2. Phân bố độ khó: Bám sát tỉ lệ "${difficultyDistribution}".
3. Mỗi câu hỏi gồm:
   - "question": Nội dung câu hỏi rõ ràng, chính xác khoa học theo chuẩn SGK ${book}.
   - "options": Mảng ĐÚNG 4 phương án lựa chọn phân biệt (A, B, C, D).
   - "correctAnswer": Số nguyên từ 0 đến 3 chỉ số đáp án đúng (0 là A, 1 là B, 2 là C, 3 là D).
   - "explanation": Lời giải thích ngắn gọn, sư phạm (1-2 câu).
   - "difficulty": Thuộc một trong 4 mức: "Nhận biết", "Thông hiểu", "Vận dụng", "Vận dụng cao".
   - "topic": Chủ đề kiến thức hoặc tên bài học.
   - Nếu môn là "Tin học" hoặc bài có code, hãy tạo đoạn code thực tế trong "codeSnippet" và ngôn ngữ trong "codeLanguage" (ví dụ python, sql, html, cpp).
4. ĐỊNH DẠNG: Chỉ trả về JSON thuần, TUYỆT ĐỐI KHÔNG chứa markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Bạn là chuyên gia khảo thí và sư phạm giáo dục phổ thông Việt Nam. Hãy trả về JSON thuần chuẩn xác theo schema, không bọc markdown.',
        thinkingConfig: {
          thinkingBudget: 0, // Tối ưu tốc độ phản hồi nhanh trong 2-4 giây
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
              codeLanguage: { type: Type.STRING, description: 'Ngôn ngữ: python, sql, html, cpp' },
            },
            required: ['question', 'options', 'correctAnswer', 'explanation', 'difficulty'],
          },
        },
      },
    });

    const rawText = response.text || '';
    if (!rawText.trim()) {
      console.error('[Vercel API generate-questions ERROR]: AI trả về phản hồi rỗng');
      res.status(500).json({ success: false, error: 'AI trả dữ liệu không hợp lệ' });
      return;
    }

    let parsed: any[];
    try {
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[Vercel API generate-questions ERROR]: Lỗi parse JSON:', parseErr, 'Raw:', rawText);
      res.status(500).json({ success: false, error: 'AI trả dữ liệu không hợp lệ' });
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error('[Vercel API generate-questions ERROR]: Kết quả không phải là mảng hoặc mảng rỗng');
      res.status(500).json({ success: false, error: 'AI trả dữ liệu không hợp lệ' });
      return;
    }

    const validatedQuestions: QuestionItem[] = [];
    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i];
      if (!item || typeof item.question !== 'string' || !item.question.trim()) continue;

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
      console.error('[Vercel API generate-questions ERROR]: Không có câu hỏi nào hợp lệ sau validate');
      res.status(500).json({ success: false, error: 'AI trả dữ liệu không hợp lệ' });
      return;
    }

    res.status(200).json({
      success: true,
      questions: validatedQuestions,
      count: validatedQuestions.length,
    });
  } catch (error: any) {
    console.error('[Vercel API generate-questions ERROR]:', error);

    const errorMessage = error?.message || String(error);
    const errorStatus = error?.status || error?.statusCode || error?.code;

    if (errorStatus === 401 || errorStatus === 403 || /api[ _-]?key|unauthorized|forbidden|credentials/i.test(errorMessage)) {
      res.status(401).json({
        success: false,
        error: 'API key Gemini chưa được cấu hình hoặc không hợp lệ',
        details: errorMessage,
      });
      return;
    }

    if (errorStatus === 429 || /quota|rate[ _-]?limit|resource[ _-]?exhausted/i.test(errorMessage)) {
      res.status(429).json({
        success: false,
        error: 'Đã hết hạn mức Gemini (Quota exceeded). Vui lòng thử lại sau giây lát.',
        details: errorMessage,
      });
      return;
    }

    if (errorStatus === 400 || /invalid[ _-]?argument|bad[ _-]?request/i.test(errorMessage)) {
      res.status(400).json({
        success: false,
        error: 'Yêu cầu không hợp lệ hoặc nội dung vi phạm chính sách của Gemini',
        details: errorMessage,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: `Lỗi máy chủ AI Gemini: ${errorMessage}`,
      details: errorMessage,
    });
  }
}
