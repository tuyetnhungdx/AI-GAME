import React from 'react';
import { Flag, Flame, Trophy, Users, Zap } from 'lucide-react';

interface RacingGameProps {
  currentScore: number;
  maxPossibleScore: number;
  streak: number;
  playerName: string;
  isTeamMode?: boolean;
  selectedTeam?: 'red' | 'blue' | 'yellow' | 'purple';
  isCorrect?: boolean | null;
}

export const RacingGame: React.FC<RacingGameProps> = ({
  currentScore,
  maxPossibleScore = 1500,
  streak,
  playerName,
  isTeamMode = false,
  selectedTeam = 'red',
  isCorrect,
}) => {
  // Real position based on score ratio (0% to 88% track length)
  const safeMax = Math.max(100, maxPossibleScore);
  const playerPercent = Math.min(88, Math.max(0, (currentScore / safeMax) * 88));

  // Simulated peer competitors whose progress is tied to realistic benchmark scores
  const bot1Score = Math.round(currentScore * 0.88 + 40);
  const bot2Score = Math.round(currentScore * 0.94 + (currentScore > 600 ? -20 : 60));
  const bot3Score = Math.round(currentScore * 0.75 + 30);

  const bot1Percent = Math.min(88, Math.max(0, (bot1Score / safeMax) * 88));
  const bot2Percent = Math.min(88, Math.max(0, (bot2Score / safeMax) * 88));
  const bot3Percent = Math.min(88, Math.max(0, (bot3Score / safeMax) * 88));

  return (
    <div className="w-full bg-[#071324] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl relative overflow-hidden">
      {/* Background track line grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-cyan-500/20 pb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🏎️</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-cyan-300 flex items-center gap-2">
              ĐƯỜNG ĐUA KIẾN THỨC
              {streak >= 3 && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded-full font-bold animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  NITRO X{streak}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Vị trí xe di chuyển trực tiếp theo tổng điểm tích lũy ({currentScore} / {maxPossibleScore} pts)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700/80 text-cyan-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vận tốc: <strong>{80 + streak * 20} km/h</strong></span>
          </div>
        </div>
      </div>

      {/* Track Canvas */}
      <div className="relative bg-[#050B14] border border-slate-800 rounded-2xl p-3 sm:p-4 overflow-hidden z-10">
        {/* Finish Line Pattern */}
        <div className="absolute right-4 top-0 bottom-0 w-8 flex flex-col justify-around select-none pointer-events-none opacity-50">
          <div className="h-full w-full bg-[repeating-conic-gradient(#fff_0_90deg,#000_0_180deg)_0_0/10px_10px] opacity-60 border-l-2 border-white/60"></div>
        </div>
        <div className="absolute right-3 top-2 text-[10px] font-bold text-amber-300 flex items-center gap-1 z-20">
          <Flag className="w-3.5 h-3.5 text-amber-400" /> ĐÍCH
        </div>

        {/* Lanes */}
        <div className="space-y-2.5 relative">
          {/* Lane 1: Player / Team Red */}
          <div className="relative h-11 bg-slate-900/80 border border-cyan-500/50 rounded-xl flex items-center px-2 shadow-inner">
            <div className="absolute left-2 text-[10px] text-cyan-400 font-bold uppercase select-none">
              LÀN 1: {isTeamMode ? 'ĐỘI ĐỎ (BẠN)' : `BẠN (${playerName})`}
            </div>

            {/* Player Car */}
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1.5"
              style={{ left: `calc(${playerPercent}% + 6px)` }}
            >
              <div className="relative flex items-center">
                {streak >= 3 && (
                  <span className="text-xs -mr-1 animate-pulse select-none">🔥</span>
                )}
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] select-none">
                  🏎️
                </span>
                {isCorrect === true && (
                  <span className="absolute -top-3 left-2 text-[10px] font-bold text-emerald-400 animate-bounce">
                    +TỐC ĐỘ!
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded shadow">
                {currentScore} pts
              </span>
            </div>
          </div>

          {/* Lane 2: Competitor / Team Blue */}
          <div className="relative h-9 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-slate-500 select-none">
              LÀN 2: {isTeamMode ? 'ĐỘI XANH DƯƠNG' : 'Trần Thu Hà (12A1)'}
            </div>
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1 opacity-80"
              style={{ left: `calc(${bot2Percent}% + 6px)` }}
            >
              <span className="text-xl select-none">🚗</span>
              <span className="text-[9px] font-mono text-slate-400">{bot2Score}</span>
            </div>
          </div>

          {/* Lane 3: Competitor / Team Yellow */}
          <div className="relative h-9 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-slate-500 select-none">
              LÀN 3: {isTeamMode ? 'ĐỘI VÀNG' : 'Nguyễn Văn An (12A1)'}
            </div>
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1 opacity-80"
              style={{ left: `calc(${bot1Percent}% + 6px)` }}
            >
              <span className="text-xl select-none">🚙</span>
              <span className="text-[9px] font-mono text-slate-400">{bot1Score}</span>
            </div>
          </div>

          {/* Lane 4: Competitor / Team Purple */}
          <div className="relative h-9 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center px-2">
            <div className="absolute left-2 text-[10px] text-slate-500 select-none">
              LÀN 4: {isTeamMode ? 'ĐỘI TÍM' : 'Lê Hoàng Nam (12A1)'}
            </div>
            <div
              className="absolute transition-all duration-700 ease-out flex items-center gap-1 opacity-80"
              style={{ left: `calc(${bot3Percent}% + 6px)` }}
            >
              <span className="text-xl select-none">🏎️</span>
              <span className="text-[9px] font-mono text-slate-400">{bot3Score}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
