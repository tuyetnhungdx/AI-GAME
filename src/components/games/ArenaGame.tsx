import React from 'react';
import { Shield, Sparkles, Swords, Trophy, Zap } from 'lucide-react';

interface ArenaGameProps {
  score: number;
  streak: number;
  playerName: string;
  isCorrect?: boolean | null;
}

export const ArenaGame: React.FC<ArenaGameProps> = ({
  score,
  streak,
  playerName,
  isCorrect,
}) => {
  // Team Red (Player) energy vs Team Blue energy
  const playerEnergy = Math.min(100, Math.max(10, Math.round((score / 1200) * 100)));
  const rivalEnergy = Math.min(100, Math.max(10, Math.round(55 + (score > 600 ? 15 : -10))));

  const total = playerEnergy + rivalEnergy;
  const playerWidth = Math.round((playerEnergy / total) * 100);
  const rivalWidth = 100 - playerWidth;

  return (
    <div className="w-full bg-[#140C20] border border-rose-500/40 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-rose-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">⚔️</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-rose-300">
              ĐẤU TRƯỜNG KIẾN THỨC
            </h3>
            <p className="text-[11px] text-slate-400">
              Cạnh tranh năng lượng tri thức: Đội Đỏ (Bạn) vs Đội Xanh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-amber-400 font-bold bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
            Năng lượng: {playerEnergy * 10} kW
          </span>
        </div>
      </div>

      {/* Energy Tug-of-war Gauge */}
      <div className="space-y-3 py-2">
        <div className="flex justify-between items-center text-xs font-black">
          <div className="flex items-center gap-1.5 text-rose-400">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>ĐỘI ĐỎ ({playerName}): {score} pts</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span>ĐỘI XANH ĐỐI THỦ: {rivalEnergy * 10} pts</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Dual power progress bar */}
        <div className="h-6 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-700 p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-l-full transition-all duration-700 flex items-center justify-start pl-2 text-[10px] font-black text-white"
            style={{ width: `${playerWidth}%` }}
          >
            {playerWidth}%
          </div>
          <div
            className="h-full bg-gradient-to-l from-cyan-600 via-cyan-500 to-blue-500 rounded-r-full transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-black text-white"
            style={{ width: `${rivalWidth}%` }}
          >
            {rivalWidth}%
          </div>
        </div>

        {/* Status text */}
        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>{playerWidth > 50 ? '🔥 Đội của bạn đang chiếm ưu thế năng lượng!' : '⚡ Cố lên! Hãy trả lời đúng câu này để lội ngược dòng!'}</span>
          <span>Khí thế: <strong className="text-amber-400">X{streak + 1}</strong></span>
        </div>
      </div>
    </div>
  );
};
