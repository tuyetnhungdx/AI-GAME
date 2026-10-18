import React from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Bot, 
  CheckCircle2, 
  Flame, 
  Gamepad2, 
  Layers, 
  Play, 
  School, 
  Sparkles, 
  Users, 
  Zap 
} from 'lucide-react';
import { Game } from '../types';
import { sounds } from '../utils/audio';

interface LandingPageProps {
  onStartCreateAI: () => void;
  onJoinGame: () => void;
  onSelectGameCard: (game: Game) => void;
  featuredGames: Game[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartCreateAI,
  onJoinGame,
  onSelectGameCard,
  featuredGames,
}) => {
  const steps = [
    { num: '01', title: 'Tạo câu hỏi bằng AI', desc: 'Dán nội dung SGK, AI tự phân bổ câu hỏi trắc nghiệm chuẩn THPT và sinh mã code lập trình.' },
    { num: '02', title: 'Chọn kiểu trò chơi', desc: 'Chọn 1 trong 8 mẫu: Đường đua kiến thức, Vòng quay, Gỡ bom, Lật mảnh ghép, Chinh phục vũ trụ...' },
    { num: '03', title: 'Chia sẻ mã phòng', desc: 'Chiếu mã 6 ký tự hoặc mã QR lên máy chiếu lớp học, học sinh vào thi đấu ngay không cần lập nick.' },
    { num: '04', title: 'Phân tích kết quả AI', desc: 'Bảng xếp hạng thời gian thực kèm báo cáo AI chỉ rõ kiến thức học sinh còn yếu để ôn lại.' },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Neon Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[400px] bg-gradient-to-tr from-cyan-500/20 via-purple-600/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Học mà chơi – Chơi để hiểu – AI đồng hành cùng lớp học</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none max-w-4xl mx-auto">
          BIẾN BÀI HỌC THÀNH TRÒ CHƠI VỚI <span className="bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">TRÍ TUỆ NHÂN TẠO</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 mt-6 max-w-3xl mx-auto leading-relaxed">
          Tạo câu hỏi – Chọn trò chơi – Chia sẻ mã – Học sinh tham gia – Theo dõi kết quả
        </p>

        {/* 2 Big Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            onClick={() => {
              sounds.playSpinClick();
              onStartCreateAI();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white font-black text-sm sm:text-base tracking-wide shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>TẠO TRÒ CHƠI BẰNG AI</span>
          </button>

          <button
            onClick={() => {
              sounds.playSpinClick();
              onJoinGame();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-black text-sm sm:text-base tracking-wide shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5"
          >
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>THAM GIA GAME (MÃ PHÒNG)</span>
          </button>
        </div>

        {/* Quick Demo TIN012 banner */}
        <div className="mt-8 max-w-md mx-auto p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 animate-bounce" />
            <span>Phòng demo thử nghiệm: <strong>TIN012</strong> (Tin học 12)</span>
          </div>
          <button
            onClick={onJoinGame}
            className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors"
          >
            Vào ngay
          </button>
        </div>
      </section>

      {/* 4 STEPS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            QUY TRÌNH 4 BƯỚC ĐƠN GIẢN CHO GIÁO VIÊN
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Không cần chuẩn bị phức tạp – Chỉ mất 1 phút để có ngay trò chơi sôi động trên lớp
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st) => (
            <div
              key={st.num}
              className="bg-[#0A1424] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg hover:border-cyan-500/40 transition-all"
            >
              <div className="text-3xl sm:text-4xl font-mono font-black text-cyan-500/20 mb-3">
                {st.num}
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {st.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8 FEATURED GAME CARDS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>ĐA DẠNG HÌNH THỨC THI ĐẤU</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              8 MẪU TRÒ CHƠI GIÁO DỤC NỔI BẬT
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Phù hợp với từng mục tiêu bài học: Khởi động, Khám phá, Luyện tập và Vận dụng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              onClick={() => onSelectGameCard(game)}
              className="bg-[#0A1424] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-lg group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                    {game.subject} {game.grade}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {game.questions.length} câu
                  </span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {game.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {game.lesson} ({game.textbook})
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">
                  {game.playCount || 0} lượt chơi
                </span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Chơi ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AUTHOR & PHILOSOPHY SPOTLIGHT */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-[#091526] via-[#0D1A30] to-[#120F24] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-5xl shadow-xl flex-shrink-0">
              👩‍🏫
            </div>
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                Ý TƯỞNG SÁNG TẠO DẠY HỌC THPT
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Cô Trần Thị Tuyết Nhung – Trường THPT Nguyễn Dục
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Xuất phát từ tình yêu nghề giáo và mong muốn ứng dụng công nghệ Trí tuệ Nhân tạo để đổi mới phương pháp giảng dạy môn Tin học THPT, biến những dòng code khô khan và lý thuyết mạng trừu tượng thành các đấu trường kiến thức cuốn hút học sinh.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs font-medium text-amber-300">
                <span>✓ Hỗ trợ đầy đủ khối 10, 11, 12</span>
                <span>•</span>
                <span>✓ Chương trình GDPT 2018</span>
                <span>•</span>
                <span>✓ Tích hợp chấm code tự động</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
