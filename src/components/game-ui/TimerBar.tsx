import React from 'react';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  remainingTime: number;
  totalTime: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({ remainingTime, totalTime }) => {
  const percentage = Math.max(0, Math.min(100, (remainingTime / Math.max(1, totalTime)) * 100));
  const isWarning = remainingTime <= 5;
  const isCritical = remainingTime <= 3;

  return (
    <div className="w-full space-y-1.5 my-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Clock className={`w-3.5 h-3.5 ${isWarning ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
          <span>Thời gian còn lại:</span>
        </span>
        <span
          className={`font-bold transition-all ${
            isCritical
              ? 'text-rose-400 text-sm animate-pulse'
              : isWarning
              ? 'text-amber-400'
              : 'text-cyan-300'
          }`}
        >
          {remainingTime}s / {totalTime}s
        </span>
      </div>

      <div
        className={`h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 transition-all ${
          isCritical ? 'border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : ''
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isWarning
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
