import React from 'react';
import { Eye, Lock, Sparkles, Unlock } from 'lucide-react';

interface PuzzleGameProps {
  unlockedTiles: number; // 0 to 9 or 12
  totalTiles: number;
  score: number;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  unlockedTiles,
  totalTiles = 9,
  score,
}) => {
  const tiles = Array.from({ length: totalTiles }, (_, i) => i);

  return (
    <div className="w-full bg-[#071426] border border-cyan-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧩</span>
          <div>
            <h3 className="font-bold text-base md:text-lg text-cyan-300">LẬT MẢNH GHÉP BÍ ẨN</h3>
            <p className="text-xs text-slate-400">Trả lời đúng mỗi câu để lật mở một mảnh ghép hình ảnh AI & Công nghệ!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Mảnh đã mở: <strong>{unlockedTiles}/{totalTiles}</strong></span>
        </div>
      </div>

      <div className="relative max-w-sm mx-auto h-56 rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-inner bg-slate-900 flex items-center justify-center">
        {/* Secret underlying artwork: Futuristic AI / High School Lab */}
        <div
          className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center p-4 text-center select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #1e1b4b 0%, #030712 100%)`,
          }}
        >
          <div className="text-4xl mb-1">🤖 🌐 💻</div>
          <div className="text-sm font-bold text-cyan-300">TRÍ TUỆ NHÂN TẠO & MẠNG KẾT NỐI</div>
          <div className="text-[11px] text-slate-400">THPT NGUYỄN DỤC - KỶ NGUYÊN SỐ</div>
        </div>

        {/* Tiles Grid Overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1">
          {tiles.map((idx) => {
            const isRevealed = idx < unlockedTiles;
            return (
              <div
                key={idx}
                className={`relative rounded flex items-center justify-center font-bold text-xs transition-all duration-700 select-none ${
                  isRevealed
                    ? 'opacity-0 pointer-events-none scale-90'
                    : 'bg-gradient-to-br from-slate-800 to-indigo-950 border border-cyan-500/30 text-cyan-400 shadow'
                }`}
              >
                {!isRevealed && (
                  <div className="flex flex-col items-center gap-0.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400/70" />
                    <span className="text-[10px]">#{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
