import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';

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
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    const game = body?.game;

    if (
      !game ||
      typeof game.id !== 'string' ||
      typeof game.title !== 'string' ||
      !game.settings ||
      !Array.isArray(game.questions) ||
      game.questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Trò chơi chưa có đủ dữ liệu',
      });
    }

    const db = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    for (let attempt = 0; attempt < 5; attempt++) {
      const roomCode = randomInt(100000, 1000000).toString();

      const { data, error } = await db
        .from('shared_game_rooms')
        .insert({
          room_code: roomCode,
          game_data: game,
        })
        .select('room_code, created_at')
        .single();

      if (error?.code === '23505') continue;

      if (error) throw error;

      return res.status(200).json({
        success: true,
        room: {
          id: `shared-${roomCode}`,
          roomCode,
          gameId: game.id,
          game,
          status: 'waiting',
          createdAt: data.created_at,
          participants: [],
        },
      });
    }

    throw new Error('Không tạo được mã phòng');
  } catch (error) {
    console.error('Create room failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Không lưu được phòng chơi vào Supabase',
    });
  }
}
