import { supabase } from './supabase';
import { groupResultRows, resultColumns } from './resultRows';
import type { Participant, ParticipantAnswer } from '../types';

export async function loadSavedGameResults(gameId: string, roomCode?: string): Promise<Participant[]> {
  const pageSize = 500;
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase.from('results').select(resultColumns).eq('game_id', gameId);
    if (roomCode) query = query.eq('room_code', roomCode);
    const { data, error } = await query.order('completed_at').order('id').range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) break;
  }

  const groups = groupResultRows(rows);
  const answersByResult = new Map<string, ParticipantAnswer[]>();
  const ids = groups.flatMap(group => group.ids);
  for (let start = 0; start < ids.length; start += 50) {
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from('answers')
        .select('id,result_id,question_id,question_number,question_text,chosen_answer,chosen_answer_text,correct_answer,correct_answer_text,is_correct,response_time,score_awarded')
        .in('result_id', ids.slice(start, start + 50)).order('question_number').order('id')
        .range(offset, offset + pageSize - 1);
      if (error) throw error;
      for (const answer of data) {
        const answers = answersByResult.get(answer.result_id) ?? [];
        answers.push({
          questionId: answer.question_id, questionNumber: answer.question_number,
          questionText: answer.question_text, chosenAnswer: answer.chosen_answer,
          chosenAnswerText: answer.chosen_answer_text, correctAnswer: answer.correct_answer,
          correctAnswerText: answer.correct_answer_text, isCorrect: answer.is_correct,
          responseTime: answer.response_time, scoreAwarded: answer.score_awarded,
          baseScore: 0, speedBonus: 0, streakBonus: 0,
        });
        answersByResult.set(answer.result_id, answers);
      }
      if (data.length < pageSize) break;
    }
  }

  return groups.map(({ row, ids }) => ({
    id: row.id, roomId: row.room_code, streak: 0, maxStreak: 0, studentName: row.student_name, className: row.class_name,
    score: row.score, correctCount: row.correct_count, wrongCount: row.wrong_count,
    totalTimeSeconds: row.total_time_seconds, rank: row.rank,
    joinedAt: row.completed_at, completedAt: row.completed_at, finished: true,
    answers: ids.map(id => answersByResult.get(id)).find(Boolean) ?? [],
  }));
}
