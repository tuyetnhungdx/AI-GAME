-- ====================================================================
-- AI GAME HỌC TẬP - HỆ THỐNG CƠ SỞ DỮ LIỆU SUPABASE
-- Người xây dựng ý tưởng: Cô Trần Thị Tuyết Nhung - THPT Nguyễn Dục
-- Hướng dẫn: Dán toàn bộ mã này vào mục "SQL Editor" trên Supabase và bấm "RUN"
-- ====================================================================

-- 1. BẢNG RESULTS (Lưu kết quả tổng hợp khi học sinh hoàn thành game)
CREATE TABLE IF NOT EXISTS public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  game_title TEXT NOT NULL,
  game_id TEXT,
  room_code VARCHAR(20) NOT NULL,
  score INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  wrong_count INT NOT NULL DEFAULT 0,
  accuracy_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_time_seconds INT NOT NULL DEFAULT 0,
  rank INT NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG ANSWERS (Lưu chi tiết từng câu hỏi học sinh đã trả lời)
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID REFERENCES public.results(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  room_code VARCHAR(20),
  question_id TEXT,
  question_number INT,
  question_text TEXT,
  chosen_answer INT,
  chosen_answer_text TEXT,
  correct_answer INT,
  correct_answer_text TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time INT NOT NULL DEFAULT 0,
  score_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG CLASSES (Danh mục Lớp học của giáo viên)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  school_year TEXT NOT NULL DEFAULT '2025-2026',
  student_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG STUDENTS (Danh sách học sinh theo từng lớp)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  student_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_name, student_code)
);

-- 5. BẢNG ROOMS (Phòng chơi trực tuyến)
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(20) NOT NULL UNIQUE,
  game_title TEXT NOT NULL,
  game_id TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TẠO CHỈ MỤC (INDEXES) ĐỂ TRUY VẤN VÀ XUẤT EXCEL CỰC NHANH
CREATE INDEX IF NOT EXISTS idx_results_class_name ON public.results(class_name);
CREATE INDEX IF NOT EXISTS idx_results_room_code ON public.results(room_code);
CREATE INDEX IF NOT EXISTS idx_results_game_title ON public.results(game_title);
CREATE INDEX IF NOT EXISTS idx_results_completed_at ON public.results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_result_id ON public.answers(result_id);
CREATE INDEX IF NOT EXISTS idx_answers_class_name ON public.answers(class_name);

-- BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP QUYỀN TRUY CẬP
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- CHO PHÉP HỌC SINH & GIÁO VIÊN ĐỌC VÀ GHI DỮ LIỆU TỰ ĐỘNG (DÙNG ANON KEY)
DROP POLICY IF EXISTS "Cho phép xem kết quả" ON public.results;
CREATE POLICY "Cho phép xem kết quả" ON public.results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cho phép lưu kết quả" ON public.results;
CREATE POLICY "Cho phép lưu kết quả" ON public.results FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Cho phép cập nhật kết quả" ON public.results;
CREATE POLICY "Cho phép cập nhật kết quả" ON public.results FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Cho phép xem câu trả lời" ON public.answers;
CREATE POLICY "Cho phép xem câu trả lời" ON public.answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Cho phép lưu câu trả lời" ON public.answers;
CREATE POLICY "Cho phép lưu câu trả lời" ON public.answers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Cho phép xem lớp" ON public.classes;
CREATE POLICY "Cho phép xem lớp" ON public.classes FOR ALL USING (true);

DROP POLICY IF EXISTS "Cho phép xem học sinh" ON public.students;
CREATE POLICY "Cho phép xem học sinh" ON public.students FOR ALL USING (true);

DROP POLICY IF EXISTS "Cho phép phòng chơi" ON public.rooms;
CREATE POLICY "Cho phép phòng chơi" ON public.rooms FOR ALL USING (true);

-- THÊM SẴN DỮ LIỆU CÁC LỚP CỦA TRƯỜNG THPT NGUYỄN DỤC ĐỂ SỬ DỤNG NGAY
INSERT INTO public.classes (name, school_year, student_count) VALUES
  ('12A1', '2025-2026', 42),
  ('12A2', '2025-2026', 38),
  ('11A1', '2025-2026', 40),
  ('11A2', '2025-2026', 39),
  ('10A1', '2025-2026', 45),
  ('10A2', '2025-2026', 44)
ON CONFLICT (name) DO NOTHING;
