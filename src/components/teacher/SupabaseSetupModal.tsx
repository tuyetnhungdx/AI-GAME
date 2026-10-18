import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Terminal, 
  Check,
  Server
} from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_CODE = `-- ====================================================================
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
ON CONFLICT (name) DO NOTHING;`;

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{
    loading: boolean;
    connected: boolean;
    tablesReady: boolean;
    message: string;
    totalResults?: number;
  }>({
    loading: false,
    connected: true,
    tablesReady: false,
    message: 'Chưa kiểm tra trạng thái',
  });

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/supabase-status');
      const data = await res.json();
      setStatus({
        loading: false,
        connected: data.connected,
        tablesReady: data.tablesReady,
        message: data.message,
        totalResults: data.totalResults,
      });
    } catch {
      setStatus({
        loading: false,
        connected: false,
        tablesReady: false,
        message: 'Không thể kết nối đến máy chủ API',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Kết nối & Lưu trữ Supabase
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  loewfhccqxbynmtjtgjo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tự động lưu điểm, số câu đúng/sai và chi tiết từng câu của học sinh vào cơ sở dữ liệu Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            status.tablesReady 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : status.connected 
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {status.tablesReady ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {status.tablesReady 
                    ? 'Đã kết nối hoàn hảo! Các bảng dữ liệu đã sẵn sàng.'
                    : 'Đã nhận diện dự án Supabase, cần chạy mã SQL để tạo bảng!'}
                </p>
                <p className="text-xs opacity-80 mt-0.5">{status.message}</p>
                {status.totalResults !== undefined && status.totalResults > 0 && (
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    📊 Hiện có {status.totalResults} bản ghi kết quả học sinh trong database Supabase.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={checkStatus}
              disabled={status.loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 shrink-0 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status.loading ? 'animate-spin' : ''}`} />
              <span>{status.loading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}</span>
            </button>
          </div>

          {/* 3 Steps instructions */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-cyan-400">
              <Server className="w-4 h-4" />
              Cách khởi tạo bảng trên Supabase trong 2 phút (Chỉ làm 1 lần duy nhất):
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
              <li>
                Bấm nút <strong className="text-emerald-400">"Sao chép toàn bộ mã SQL"</strong> ở bên dưới.
              </li>
              <li>
                Mở trang quản trị dự án Supabase của cô tại:{' '}
                <a 
                  href="https://supabase.com/dashboard/project/loewfhccqxbynmtjtgjo/sql/new" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline font-mono inline-flex items-center gap-1 font-bold"
                >
                  supabase.com/dashboard/project/.../sql/new
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Dán (Ctrl + V) mã SQL vào ô soạn thảo, sau đó bấm nút màu xanh <strong className="text-emerald-400">RUN</strong> (hoặc nhấn Ctrl + Enter).
              </li>
              <li>
                Quay lại đây bấm nút <strong className="text-cyan-400">"Kiểm tra lại"</strong> là xong! Mọi học sinh khi chơi xong đều tự động lưu điểm lên Supabase.
              </li>
            </ol>
          </div>

          {/* SQL Snippet box */}
          <div className="relative">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>MÃ SQL TẠO BẢNG SUPABASE (PostgreSQL):</span>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép toàn bộ mã SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed select-all">
              {SUPABASE_SQL_CODE}
            </pre>
          </div>

          {/* Quick info note */}
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Mã SQL đã cấu hình phân quyền <strong>Row Level Security (RLS)</strong> chuẩn xác: Cho phép học sinh gửi kết quả tự động mà <strong>không cần đăng nhập</strong>, đảm bảo bảo mật cho giáo viên!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Đóng
          </button>
          <button
            onClick={handleCopy}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép thành công!' : 'Sao chép mã SQL & Mở Supabase'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
