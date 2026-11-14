import { roomAttendanceIdentity } from '../src/lib/roomAttendanceIdentity.ts';
import { createClient } from '@supabase/supabase-js';
import { groupResultRows, resultColumns } from '../src/lib/resultRows.ts';

function wholeSeconds(value: unknown) {
  const seconds = Number(value ?? 0);
  return Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST' && req.method !== 'GET') {
  return res.status(405).json({
    success: false,
    error: 'Chỉ hỗ trợ GET hoặc POST',
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
  // GET: lấy số lượt chơi thật của từng game
if (req.method === 'GET') {
  try {
    if (req.query?.metric === 'attendance') {
      const pageSize = 500;
      const gamesByRoom = new Map<string, string>();
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await db.from('shared_game_rooms')
          .select('room_code,game_id:game_data->>id').order('room_code')
          .range(offset, offset + pageSize - 1);
        if (error) throw error;
        for (const row of data) {
          if (typeof row.game_id === 'string' && row.game_id) gamesByRoom.set(row.room_code, row.game_id);
        }
        if (data.length < pageSize) break;
      }

      const counts: Record<string, number> = Object.create(null);
      const seen = new Set<string>();
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await db.from('room_participants')
          .select('room_code,class_name,student_name').order('id')
          .range(offset, offset + pageSize - 1);
        if (error) throw error;
        for (const row of data) {
          const gameId = gamesByRoom.get(row.room_code);
          if (!gameId) continue;
          const key = JSON.stringify([row.room_code, roomAttendanceIdentity(row)]);
          if (seen.has(key)) continue;
          seen.add(key);
          counts[gameId] = (counts[gameId] ?? 0) + 1;
        }
        if (data.length < pageSize) break;
      }
      return res.status(200).json({ success: true, counts });
    }

    const rows = [];
    const pageSize = 500;
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await db.from('results').select(resultColumns)
        .order('completed_at').order('id').range(offset, offset + pageSize - 1);
      if (error) throw error;
      rows.push(...data);
      if (data.length < pageSize) break;
    }

    const counts: Record<string, number> = Object.create(null);
    for (const { row } of groupResultRows(rows)) {
      if (row.game_id) counts[row.game_id] = (counts[row.game_id] ?? 0) + 1;
    }

    return res.status(200).json({
      success: true,
      counts,
    });
  } catch (error: any) {
    console.error('Load play counts failed:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Không lấy được số lượt chơi',
    });
  }
}

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    const resultId = body?.resultId;
    if (resultId !== undefined && (typeof resultId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(resultId))) {
      return res.status(400).json({ success: false, error: 'Mã kết quả không hợp lệ' });
    }
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
    const totalTimeSeconds = wholeSeconds(body?.totalTimeSeconds);
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
        ...(resultId ? { id: resultId } : {}),
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

    if (resultError?.code === '23505' && resultId) {
      const { data: existing, error } = await db.from('results').select('id')
        .eq('id', resultId).eq('room_code', roomCode).eq('game_id', gameId)
        .eq('student_name', studentName).eq('class_name', className).maybeSingle();
      if (error || !existing) throw error || resultError;
      const { count, error: detailsError } = await db.from('answers')
        .select('id', { count: 'exact', head: true }).eq('result_id', resultId);
      return res.status(200).json({
        success: true,
        answersSaved: !body.answers?.length || (!detailsError && count === body.answers.length),
      });
    }
    if (resultError) throw resultError;

    let answersSaved = true;
    if (Array.isArray(body?.answers) && body.answers.length > 0) {
      const { error } = await db.from('answers').insert(body.answers.map((answer: any, index: number) => ({
        result_id: savedResult.id, student_name: studentName, class_name: className, room_code: roomCode,
        question_id: answer.questionId, question_number: answer.questionNumber ?? index + 1,
        question_text: answer.questionText, chosen_answer: answer.chosenAnswer,
        chosen_answer_text: answer.chosenAnswerText, correct_answer: answer.correctAnswer,
        correct_answer_text: answer.correctAnswerText, is_correct: answer.isCorrect,
        response_time: wholeSeconds(answer.responseTime), score_awarded: answer.scoreAwarded ?? 0,
      })));
      answersSaved = !error;
      if (error) console.error('Save answer details failed:', error.message);
    }

    // 2. Cập nhật thống kê đúng học sinh
    if (studentId) {
      const { data: student, error: studentError } = await db
        .from('ai_students')
        .select('id, completed_games, avg_score')
        .eq('id', studentId)
        .maybeSingle();

      if (studentError) console.error('Load student statistics failed:', studentError.message);

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

        if (updateError) console.error('Update student statistics failed:', updateError.message);
      }
    }

    return res.status(200).json({
      success: true,
      result: savedResult,
      answersSaved,
    });
  } catch (error: any) {
    console.error('Save result failed:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'Không lưu được kết quả',
    });
  }
}
