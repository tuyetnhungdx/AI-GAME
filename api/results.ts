import { createClient } from '@supabase/supabase-js';

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

  const db = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    const studentId = String(body?.studentId || '').trim();
    const studentName = String(body?.studentName || '').trim();
    const className = String(body?.className || '').trim();
    const gameTitle = String(body?.gameTitle || '').trim();
    const gameId = String(body?.gameId || '').trim();
    const roomCode = String(body?.roomCode || '').trim();

    const score = Number(body?.score || 0);
    const correctCount = Number(body?.correctCount || 0);
    const wrongCount = Number(body?.wrongCount || 0);
    const accuracyRate = Number(body?.accuracyRate || 0);
    const totalTimeSeconds = Number(body?.totalTimeSeconds || 0);
    const rank = Number(body?.rank || 1);

    if (!studentName || !className || !gameTitle) {
      return res.status(400).json({
        success: false,
        error: 'Thiếu thông tin kết quả bài chơi',
      });
    }

    // 1. Lưu kết quả chi tiết
    const { data: savedResult, error: resultError } = await db
      .from('results')
      .insert({
        student_name: studentName,
        class_name: className,
        game_title: gameTitle,
        game_id: gameId,
        room_code: roomCode,
        score,
        correct_count: correctCount,
        wrong_count: wrongCount,
        accuracy_rate: accuracyRate,
        total_time_seconds: totalTimeSeconds,
        rank,
      })
      .select()
      .single();

    if (resultError) throw resultError;

    // 2. Cập nhật thống kê đúng học sinh
    if (studentId) {
      const { data: student, error: studentError } = await db
        .from('ai_students')
        .select('id, completed_games, avg_score')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) throw studentError;

      if (student) {
        const oldCompleted = Number(student.completed_games || 0);
        const oldAverage = Number(student.avg_score || 0);

        // Quy đổi accuracy 0–100 thành điểm trung bình 0–10
        const currentScore10 = accuracyRate / 10;

        const newCompleted = oldCompleted + 1;

        const newAverage =
          Math.round(
            (
              (
                oldAverage * oldCompleted +
                currentScore10
              ) /
              newCompleted
            ) *
              100
          ) / 100;

        const { error: updateError } = await db
          .from('ai_students')
          .update({
            completed_games: newCompleted,
            avg_score: newAverage,
          })
          .eq('id', studentId);

        if (updateError) throw updateError;
      }
    }

    return res.status(200).json({
      success: true,
      result: savedResult,
    });
  } catch (error: any) {
    console.error('Save result failed:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Không lưu được kết quả',
    });
  }
}
