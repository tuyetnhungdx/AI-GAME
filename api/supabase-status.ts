import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Chỉ hỗ trợ GET',
    });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(200).json({
      connected: false,
      tablesReady: false,
      message: 'Thiếu cấu hình Supabase trên Vercel.',
    });
  }

  try {
    const db = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    for (const table of ['results', 'answers']) {
      const { error } = await db
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        const missingTable = [
          'PGRST205',
          '42P01',
        ].includes(error.code);

        console.error('Supabase status:', table, error);

        return res.status(200).json({
          connected: missingTable,
          tablesReady: false,
          message: missingTable
            ? `Chưa tìm thấy bảng ${table}.`
            : `Kiểm tra thất bại, mã lỗi: ${error.code || 'không xác định'}. Xem Vercel Logs.`,
        });
      }
    }

    return res.status(200).json({
      connected: true,
      tablesReady: true,
      message: 'Đã kết nối và đọc được hai bảng results, answers.',
    });
  } catch {
    return res.status(200).json({
      connected: false,
      tablesReady: false,
      message: 'Không kiểm tra được kết nối. Kiểm tra URL và cấu hình Vercel.',
    });
  }
}
