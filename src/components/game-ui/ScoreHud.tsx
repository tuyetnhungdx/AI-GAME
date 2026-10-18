import React from 'react';
import { Flame, Trophy, User } from 'lucide-react';

interface ScoreHudProps {
  studentName: string;
  className: string;
  score: number;
  streak: number;
  currentIndex: number;
  totalQuestions: number;
  streakMessage?: string | null;
}

export const ScoreHud: React.FC<ScoreHudProps> = ({
  studentName,
  className,
  score,
  streak,
  currentIndex,
  totalQuestions,
  streakMessage,
}) => {
  return (
    <div className="space-y-2 mb-4">
      {/* Top HUD Box */}
      <div className="flex items-center justify-between gap-3 bg-[#0A1424] border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-lg">
        {/* Student identification */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>{studentName}</span>
              <span className="text-[10px] text-cyan-400 font-mono">({className})</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Tiến độ: <strong className="text-cyan-300 font-mono">{currentIndex + 1} / {totalQuestions}</strong>
            </div>
          </div>
        </div>

        {/* Streak HUD */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
            <Flame
              className={`w-4 h-4 transition-transform ${
                streak >= 3
                  ? 'text-amber-400 fill-amber-400 animate-pulse scale-110'
                  : 'text-slate-600'
              }`}
            />
            <span className={streak >= 3 ? 'text-amber-300 font-bold' : 'text-slate-400'}>
              {streak} chuỗi
            </span>
          </div>
        </div>

        {/* Total Score HUD */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">ĐIỂM</div>
          <div className="text-base sm:text-xl font-mono font-black text-amber-300 flex items-center gap-1 justify-end">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{score}</span>
          </div>
        </div>
      </div>

      {/* Streak Alert Banner Popup if triggered */}
      {streakMessage && (
        <div className="p-2.5 bg-amber-500/20 border border-amber-500/50 rounded-xl text-center text-xs font-bold text-amber-200 animate-bounce flex items-center justify-center gap-2 shadow-md">
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{streakMessage}</span>
        </div>
      )}
    </div>
  );
};
