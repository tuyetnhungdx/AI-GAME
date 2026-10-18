-- ====================================================================
-- AI GAME HỌC TẬP - SUPABASE DATABASE SCHEMA
-- Ý tưởng: Cô Trần Thị Tuyết Nhung - Trường THPT Nguyễn Dục
-- Môn: Tin học THPT
-- Khẩu hiệu: Học mà chơi – Chơi để hiểu – AI đồng hành cùng lớp học
-- ====================================================================

-- 1. PROFILES (Giáo viên & Người dùng)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  school TEXT NOT NULL DEFAULT 'Trường THPT Nguyễn Dục',
  subject TEXT NOT NULL DEFAULT 'Tin học',
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLASSES (Lớp học)
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. 12A1, 12A2, 11A1, 10A1
  school_year TEXT NOT NULL DEFAULT '2025-2026',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS (Học sinh)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_code)
);

-- 4. QUESTION_SETS (Bộ câu hỏi)
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Tin học',
  grade TEXT NOT NULL DEFAULT '12',
  textbook TEXT DEFAULT 'Kết nối tri thức',
  lesson TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTIONS (Chi tiết từng câu hỏi)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice_4',
  options JSONB NOT NULL, -- ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"]
  correct_answer INT NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao')),
  topic TEXT,
  code_snippet TEXT,
  code_language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GAMES (Trò chơi giáo dục)
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_set_id UUID REFERENCES question_sets(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('racing', 'wheel', 'bomb', 'puzzle', 'space', 'castle', 'treasure', 'arena')),
  settings JSONB NOT NULL DEFAULT '{"timePerQuestion": 20, "showExplanation": true, "allowRetry": true, "mode": "live_class"}'::jsonb,
  play_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROOMS (Phòng chơi trực tuyến)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  room_code VARCHAR(10) UNIQUE NOT NULL, -- e.g. "TIN012"
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);

-- 8. PARTICIPANTS (Người tham gia phòng chơi)
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  max_streak INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  total_time_seconds INT NOT NULL DEFAULT 0,
  finished BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ANSWERS (Lịch sử trả lời chi tiết của học sinh)
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  chosen_answer INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time INT NOT NULL,
  score_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RESULTS (Kết quả chung kết)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  score INT NOT NULL,
  correct_count INT NOT NULL,
  wrong_count INT NOT NULL,
  duration INT NOT NULL,
  rank INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_participants_room ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_answers_participant ON answers(participant_id);
CREATE INDEX IF NOT EXISTS idx_questions_set ON questions(question_set_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Allow public read on active rooms and questions during gameplay
CREATE POLICY "Public can view active rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public can join rooms" ON participants FOR ALL USING (true);
CREATE POLICY "Public can submit answers" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public can read games" ON games FOR SELECT USING (true);
