import { createHash, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const digest = (value: string) => createHash('sha256').update(value).digest();

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminKey = process.env.GEMINI_GAMES_ADMIN_KEY;
  if (!url || !key || (req.method === 'POST' && (!adminKey || adminKey.length < 20))) {
    return res.status(503).json({ error: 'Chưa cấu hình lưu link dùng chung.' });
  }

  if (req.method === 'POST') {
    const authorization = req.headers.authorization;
    if (
      !adminKey ||
      typeof authorization !== 'string' ||
      !timingSafeEqual(digest(authorization), digest(`Bearer ${adminKey}`))
    ) {
      return res.status(401).json({ error: 'Mã quản lý chưa đúng.' });
    }
  }

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === 'GET') {
    const { data, error } = await db.from('ai_gemini_games')
      .select('title, grade, lesson, url').order('created_at');
    if (error) return res.status(503).json({ error: 'Chưa tải được danh sách link dùng chung.' });
    return res.status(200).json({ games: data });
  }

  const { title, grade, lesson, url: link } = req.body ?? {};
  if (
    typeof title !== 'string' || !title.trim() || title.trim().length > 120 ||
    !['10', '11', '12'].includes(grade) ||
    typeof lesson !== 'string' || !lesson.trim() || lesson.trim().length > 100 ||
    typeof link !== 'string' || link.length > 2048
  ) {
    return res.status(400).json({ error: 'Kiểm tra tên game, khối lớp, tên bài và link.' });
  }

  let parsedLink: URL;
  try {
    parsedLink = new URL(link.trim());
  } catch {
    return res.status(400).json({ error: 'Link chia sẻ chưa hợp lệ.' });
  }
  if (parsedLink.protocol !== 'https:' || parsedLink.username || parsedLink.password) {
    return res.status(400).json({ error: 'Hãy dùng link chia sẻ HTTPS.' });
  }

  const game = { title: title.trim(), grade, lesson: lesson.trim(), url: parsedLink.href };
  const { error } = await db.from('ai_gemini_games').insert(game);
  if (error?.code === '23505') return res.status(409).json({ error: 'Link này đã có trong danh sách.' });
  if (error) return res.status(503).json({ error: 'Chưa lưu được link. Kiểm tra cấu hình Supabase.' });
  return res.status(201).json({ game });
}
