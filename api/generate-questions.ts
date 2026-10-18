import type { IncomingMessage, ServerResponse } from 'http';
import { generateQuestionsWithGemini } from '../src/lib/geminiQuestionGenerator';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const result = await generateQuestionsWithGemini(body);

    if (!result.success) {
      res.status(result.status).json({
        success: false,
        error: result.error,
        details: result.details,
      });
      return;
    }

    res.status(200).json({
      success: true,
      questions: result.questions,
      count: result.count,
    });
  } catch (error: any) {
    console.error('[Vercel API generate-questions Uncaught Exception]:', error);
    res.status(500).json({
      success: false,
      error: `Lỗi hệ thống: ${error.message || 'Không xác định'}`,
    });
  }
}
