import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://loewfhccqxbynmtjtgjo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1pnWfXAWyfVTDNK985HrUA_iNXouAT9';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Helper to check connection status and table existence in Supabase
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesReady: boolean;
  message: string;
  details?: any;
}> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      tablesReady: false,
      message: 'Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY',
    };
  }

  try {
    const { data, error } = await supabase.from('results').select('id').limit(1);
    if (error) {
      if (error.message.includes('Could not find the table') || error.code === '42P01') {
        return {
          connected: true,
          tablesReady: false,
          message: 'Đã kết nối Supabase thành công! Cần chạy mã SQL để tạo các bảng lưu kết quả.',
          details: error.message,
        };
      }
      return {
        connected: false,
        tablesReady: false,
        message: `Lỗi kết nối Supabase: ${error.message}`,
        details: error,
      };
    }

    return {
      connected: true,
      tablesReady: true,
      message: 'Kết nối Supabase hoàn hảo! Tất cả bảng dữ liệu đã sẵn sàng.',
      details: data,
    };
  } catch (err: any) {
    return {
      connected: false,
      tablesReady: false,
      message: `Không thể kết nối đến máy chủ Supabase: ${err.message || 'Lỗi mạng'}`,
      details: err,
    };
  }
}

/**
 * Save complete game results and answers to Supabase
 */
export async function saveGameResultToSupabase(payload: {
  studentName: string;
  className: string;
  gameTitle: string;
  gameId?: string;
  roomCode: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number;
  totalTimeSeconds: number;
  rank: number;
  answers: Array<{
    questionId?: string;
    questionNumber?: number;
    questionText?: string;
    chosenAnswer: number;
    chosenAnswerText?: string;
    correctAnswer?: number;
    correctAnswerText?: string;
    isCorrect: boolean;
    responseTime?: number;
    scoreAwarded?: number;
  }>;
}) {
  if (!isSupabaseConfigured) {
    return { success: false, reason: 'Supabase not configured' };
  }

  try {
    // 1. Insert into results table
    const { data: resultRow, error: resultError } = await supabase
      .from('results')
      .insert({
        student_name: payload.studentName.trim(),
        class_name: payload.className.trim(),
        game_title: payload.gameTitle,
        game_id: payload.gameId || 'game-default',
        room_code: payload.roomCode,
        score: payload.score,
        correct_count: payload.correctCount,
        wrong_count: payload.wrongCount,
        accuracy_rate: payload.accuracyRate,
        total_time_seconds: payload.totalTimeSeconds,
        rank: payload.rank,
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (resultError) {
      console.warn('Supabase insert result error:', resultError.message);
      return { success: false, error: resultError };
    }

    const resultId = resultRow?.id;

    // 2. Insert into answers table
    if (resultId && Array.isArray(payload.answers) && payload.answers.length > 0) {
      const answersToInsert = payload.answers.map((a, idx) => ({
        result_id: resultId,
        student_name: payload.studentName.trim(),
        class_name: payload.className.trim(),
        room_code: payload.roomCode,
        question_id: a.questionId,
        question_number: a.questionNumber || (idx + 1),
        question_text: a.questionText || `Câu ${idx + 1}`,
        chosen_answer: a.chosenAnswer,
        chosen_answer_text: a.chosenAnswerText || '',
        correct_answer: a.correctAnswer,
        correct_answer_text: a.correctAnswerText || '',
        is_correct: a.isCorrect,
        response_time: a.responseTime || 0,
        score_awarded: a.scoreAwarded || 0,
      }));

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToInsert);

      if (answersError) {
        console.warn('Supabase insert answers error:', answersError.message);
      }
    }

    return { success: true, resultId };
  } catch (err: any) {
    console.warn('Supabase save error:', err);
    return { success: false, error: err };
  }
}
