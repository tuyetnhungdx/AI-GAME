import React from 'react';
import { Award, BookOpen, Bot, CheckCircle, Code, Heart, Mail, School, Sparkles, User } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Card */}
      <div className="bg-[#0A1424] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-6xl shadow-xl flex-shrink-0">
            👩‍🏫
          </div>

          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-3 py-1 rounded-full uppercase">
              TÁC GIẢ Ý TƯỞNG & THIẾT KẾ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Cô Trần Thị Tuyết Nhung
            </h1>
            <div className="text-sm font-semibold text-purple-300">
              Giáo viên Tin học THPT – Trường THPT Nguyễn Dục
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>trannhungpninh@gmail.com</span>
            </p>
          </div>
        </div>

        {/* Project Slogan */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">
            KHẨU HIỆU DỰ ÁN
          </p>
          <div className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">
            “Học mà chơi – Chơi để hiểu – AI đồng hành cùng lớp học”
          </div>
        </div>
      </div>

      {/* Project Vision & Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Mục tiêu và Ý nghĩa Sư phạm
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Dự án được xây dựng với mục tiêu giúp giáo viên trường THPT dễ dàng tận dụng sức mạnh của Trí tuệ Nhân tạo (Gemini AI) để tự động hóa khâu soạn câu hỏi trắc nghiệm khách quan chuẩn cấu trúc SGK mới 2018.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
            <li>Kích thích hứng thú và động lực học tập của học sinh.</li>
            <li>Giảm tải thời gian chuẩn bị trò chơi khởi động và củng cố cho giáo viên.</li>
            <li>Cung cấp báo cáo phân tích sư phạm AI tức thì sau giờ dạy.</li>
          </ul>
        </div>

        <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            Đặc quyền cho môn Tin học THPT
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hỗ trợ hiển thị trực quan các đoạn mã lập trình (Python, C++, HTML, SQL) với Syntax Highlighting chuẩn xác:
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
            <span className="p-2 bg-slate-900 rounded-lg border border-slate-800">✓ Python Socket & List</span>
            <span className="p-2 bg-slate-900 rounded-lg border border-slate-800">✓ Truy vấn SQL CSDL</span>
            <span className="p-2 bg-slate-900 rounded-lg border border-slate-800">✓ Dự đoán kết quả code</span>
            <span className="p-2 bg-slate-900 rounded-lg border border-slate-800">✓ An toàn thông tin mạng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
