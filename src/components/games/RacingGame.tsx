import React, { useEffect } from 'react';
import { Flag, Flame, Trophy, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface RacingGameProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  streak: number;
  score: number;
  playerName: string;
  isNitroActive?: boolean;
}

export const RacingGame: React.FC<RacingGameProps> = ({
  currentQuestionIndex,
  totalQuestions,
  streak,
  score,
  playerName,
  isNitroActive,
}) => {
  const playerProgress = Math.min(100, Math.round((currentQuestionIndex / Math.max(1, totalQuestions)) * 100));

  // Simulated peer competitors on the track
  const bot1Progress = Math.min(100, Math.round(playerProgress * 0.85 + 5));
  const bot2Progress = Math.min(100, Math.round(playerProgress * 0.95 + (playerProgress > 50 ? -4 : 8)));
  const bot3Progress = Math.min(100, Math.round(playerProgress * 0.7 + 2));

  useEffect(() => {
    if (isNitroActive) {
      sounds.playNitro();
    }
  }, [isNitroActive]);

  return (
    <div className="w-full bg-[#071324] border border-cyan-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl relative overflow-hidden">
      {/* Background track lines and neon glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10 border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏎️</span>
          <div>
            <h3 className="font-bold text-base md:text-lg text-cyan-300 flex items-center gap-2">
              ĐƯỜNG ĐUA KIẾN THỨC
              {streak >= 3 && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  NITRO X{streak}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Trả lời đúng để tăng tốc – Tốc độ cao nhận thưởng gấp đôi!</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400">Tiến độ: </span>
            <span className="text-cyan-400 font-bold">{currentQuestionIndex}/{totalQuestions} câu</span>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 font-bold">{score} pts</span>
          </div>
        </div>
      </div>

      {/* Race Track Canvas */}
      <div className="relative bg-[#050B14] border border-slate-800 rounded-xl p-3 md:p-4 overflow-hidden z-10">
        {/* Finish Line Pattern */}
        <div className="absolute right-3 top-0 bottom-0 w-6 flex flex-col justify-around opacity-40 select-none pointer-events-none">
          <div className="h-full w-full bg-[repeating-conic-gradient(#fff_0_90deg,#000_0_180deg)_0_0/12px_12px] opacity-70 border-l border-white/40"></div>
        </div>
        <div className="absolute right-2 top-2 text-[10px] font-bold text-amber-300 flex items-center gap-1 z-20">
          <Flag className="w-3.5 h-3.5 text-amber-400" /> ĐÍCH
        </div>

        {/* Lanes */}
        <div className="space-y-3 relative">
          {/* Lane 1: Player */}
          <div className="relative h-11 bg-slate-900/60 border border-cyan-500/40 rounded-lg flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-cyan-400 font-semibold uppercase tracking-wider select-none">
              LÀN 1: BẠN ({playerName})
            </div>
            {/* Player Car */}
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1"
              style={{ left: `calc(${playerProgress * 0.82}% + 8px)` }}
            >
              <div className="relative">
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">🏎️</span>
                {streak >= 3 && (
                  <span className="absolute -left-3 top-1 text-xs animate-bounce">🔥</span>
                )}
              </div>
              <div className="bg-cyan-500/90 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
                {playerProgress}%
              </div>
            </div>
          </div>

          {/* Lane 2: Competitor 1 */}
          <div className="relative h-9 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-slate-500 select-none">
              LÀN 2: Trần Thu Hà (12A1)
            </div>
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1 opacity-80"
              style={{ left: `calc(${bot2Progress * 0.82}% + 8px)` }}
            >
              <span className="text-xl">🚗</span>
              <span className="text-slate-400 text-[9px] font-mono">{bot2Progress}%</span>
            </div>
          </div>

          {/* Lane 3: Competitor 2 */}
          <div className="relative h-9 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-slate-500 select-none">
              LÀN 3: Nguyễn Văn An (12A1)
            </div>
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1 opacity-80"
              style={{ left: `calc(${bot1Progress * 0.82}% + 8px)` }}
            >
              <span className="text-xl">🚙</span>
              <span className="text-slate-400 text-[9px] font-mono">{bot1Progress}%</span>
            </div>
          </div>

          {/* Lane 4: Competitor 3 */}
          <div className="relative h-9 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-slate-500 select-none">
              LÀN 4: Lê Hoàng Nam (12A1)
            </div>
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1 opacity-80"
              style={{ left: `calc(${bot3Progress * 0.82}% + 8px)` }}
            >
              <span className="text-xl">🏎️</span>
              <span className="text-slate-400 text-[9px] font-mono">{bot3Progress}%</span>
            </div>
          </div>
        </div>

        {/* Speedometer telemetry */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vận tốc kiến thức: <strong className="text-cyan-300 font-mono">{80 + streak * 25} km/h</strong></span>
          </div>
          <div>
            Chuỗi đúng liên tiếp: <span className="font-bold text-amber-400 font-mono">{streak} 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
};
