import React from 'react';
import { Award, BookOpen, Bot, Heart, Mail, School, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050B14] border-t border-cyan-500/20 text-slate-400 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Project Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-wide">
                AI GAME HỌC TẬP
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Nền tảng ứng dụng Trí tuệ Nhân tạo biến nội dung bài học thành các trò chơi giáo dục trực tuyến sinh động, giúp học sinh THPT hào hứng củng cố kiến thức và thi đua tích cực.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-medium text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Học mà chơi – Chơi để hiểu – AI đồng hành cùng lớp học</span>
            </div>
          </div>

          {/* Column 2: Teacher & School Info */}
          <div className="space-y-2 border-l-0 md:border-l border-slate-800 md:pl-6">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <School className="w-4 h-4 text-purple-400" />
              Tác giả & Đơn vị công tác
            </h4>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>
                <strong className="text-cyan-300">Ý tưởng & Thiết kế:</strong> Cô Trần Thị Tuyết Nhung
              </p>
              <p>
                <strong className="text-purple-300">Chuyên môn:</strong> Giáo viên Tin học THPT
              </p>
              <p>
                <strong className="text-amber-300">Đơn vị:</strong> Trường THPT Nguyễn Dục
              </p>
              <p className="flex items-center gap-1 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>trannhungpninh@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Column 3: Features & Support */}
          <div className="space-y-2 border-l-0 md:border-l border-slate-800 md:pl-6">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              8 Kiểu Trò Chơi Giáo Dục
            </h4>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
              <span>🏎️ Đường đua kiến thức</span>
              <span>🎡 Vòng quay may mắn</span>
              <span>💣 Gỡ bom kiến thức</span>
              <span>🧩 Lật mảnh ghép</span>
              <span>🚀 Chinh phục vũ trụ</span>
              <span>🏰 Vượt chướng ngại vật</span>
              <span>💎 Săn kho báu</span>
              <span>⚔️ Đấu trường kiến thức</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400">
              Hỗ trợ đầy đủ khối 10, 11, 12 các bộ sách: Kết nối tri thức, Cánh Diều, Chân trời sáng tạo.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 AI Game Học Tập – Phát triển phục vụ giảng dạy tại Trường THPT Nguyễn Dục.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Thiết kế ý tưởng: </span>
            <strong className="text-cyan-300 font-semibold">Cô Trần Thị Tuyết Nhung – Trường THPT Nguyễn Dục</strong>
          </div>
        </div>
      </div>
    </footer>
  );
};
