import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Chỉ hỗ trợ POST',
    });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return res.status(500).json({
      success: false,
      error: 'Chưa cấu hình Supabase trên Vercel',
    });
  }

  try {
    const code = String(req.query.code || '').trim();
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const studentName = String(body?.studentName || '').trim();
    const className = String(body?.className || '').trim();

    if (!/^\d{6}$/.test(code) || !studentName || !className) {
      return res.status(400).json({
        success: false,
        error: 'Nhập đủ mã phòng, họ tên và lớp',
      });
    }

    const db = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await db
      .from('shared_game_rooms')
      .select('room_code, game_data, created_at')
      .eq('room_code', code)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy phòng. Hãy xin mã phòng mới.',
      });
    }

    const roomId = `shared-${code}`;

    const participant = {
      id: randomUUID(),
      roomId,
      studentName,
      className,
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

    return res.status(200).json({
      success: true,
      participant,
      room: {
        id: roomId,
        roomCode: code,
        gameId: data.game_data.id,
        game: data.game_data,
        status: 'waiting',
        createdAt: data.created_at,
        participants: [participant],
      },
    });
  } catch (error) {
    console.error('Join room failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Không đọc được phòng chơi từ Supabase',
    });
  }
}
