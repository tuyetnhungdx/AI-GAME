import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Chỉ hỗ trợ GET',
    });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({
      success: false,
      error: 'Chưa cấu hình Supabase',
    });
  }

  try {
    const code = String(req.query.code || '').trim();

    const db = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await db
      .from('room_participants')
      .select('id, room_code, student_name, class_name, student_code, joined_at')
      .eq('room_code', code)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    const participants = (data || []).map((p: any) => ({
      id: p.id,
      studentName: p.student_name,
      className: p.class_name,
      studentCode: p.student_code,
      joinedAt: p.joined_at,
    }));

    return res.status(200).json({
      success: true,
      participants,
    });
  } catch (error: any) {
    console.error('Load participants failed:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Không tải được danh sách học sinh',
    });
  }
}
