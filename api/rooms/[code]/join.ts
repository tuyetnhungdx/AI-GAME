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

    const participant = {const participant = {
  id: randomUUID(),
  studentId: savedStudent?.id || null,
  roomId,
  studentName,
  className,
      // Tìm lớp học tương ứng
const { data: targetClass, error: classError } = await db
  .from('ai_classes')
  .select('id, name')
  .ilike('name', className)
  .limit(1)
  .maybeSingle();

if (classError) throw classError;

let savedStudent: any = null;

if (targetClass) {
  // Kiểm tra HS đã có trong lớp chưa
  const { data: existingStudent, error: studentFindError } =
    await db
      .from('ai_students')
      .select('*')
      .eq('class_id', targetClass.id)
      .ilike('full_name', studentName)
      .limit(1)
      .maybeSingle();

  if (studentFindError) throw studentFindError;

  if (existingStudent) {
    savedStudent = existingStudent;
  } else {
    const studentId = randomUUID();

    const { data: newStudent, error: studentInsertError } =
      await db
        .from('ai_students')
        .insert({
          id: studentId,
          class_id: targetClass.id,
          full_name: studentName,
          student_code: `HS-${studentId
            .slice(0, 8)
            .toUpperCase()}`,
          completed_games: 0,
          avg_score: 0,
        })
        .select()
        .single();

    if (studentInsertError) throw studentInsertError;

    savedStudent = newStudent;
  }
}
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
