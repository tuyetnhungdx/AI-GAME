import React from 'react';
import { Flag, Shield, Trophy } from 'lucide-react';

interface CastleGameProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  isCorrect?: boolean | null;
  isGameFinished?: boolean;
}

const CHECKPOINTS = [
  { name: 'Cầu treo', icon: '🌉' },
  { name: 'Hố sâu', icon: '🕳️' },
  { name: 'Cổng thành', icon: '🚪' },
  { name: 'Núi hiểm', icon: '⛰️' },
  { name: 'Hang động', icon: '🦇' },
  { name: 'Kho báu cuối', icon: '🏰' },
];

export const CastleGame: React.FC<CastleGameProps> = ({
  currentQuestionIndex,
  totalQuestions,
  score,
  isCorrect,
  isGameFinished = false,
}) => {
  const progressRatio = Math.min(1, Math.max(0, currentQuestionIndex / Math.max(1, totalQuestions)));
  const currentCheckpointIdx = Math.min(CHECKPOINTS.length - 1, Math.floor(progressRatio * CHECKPOINTS.length));

  return (
    <div className="w-full bg-[#081726] border border-amber-500/30 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🏰</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-amber-300">
              VƯỢT CHƯỚNG NGẠI VẬT
            </h3>
            <p className="text-[11px] text-slate-400">
              Chinh phục 6 ải thử thách: Cầu treo, Hố sâu, Cổng thành, Núi hiểm, Hang động, Lâu đài
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-amber-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
          Chặng {currentCheckpointIdx + 1} / {CHECKPOINTS.length}: <strong>{CHECKPOINTS[currentCheckpointIdx].name}</strong>
        </div>
      </div>

      {/* Map Trail */}
      <div className="relative py-4">
        <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-800 rounded-full -translate-y-1/2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${progressRatio * 100}%` }}
          ></div>
        </div>

        {/* Checkpoint Nodes */}
        <div className="flex justify-between items-center relative z-10 px-2">
          {CHECKPOINTS.map((cp, idx) => {
            const isPassed = isGameFinished || idx <= currentCheckpointIdx;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-base sm:text-lg transition-all duration-500 ${
                    isPassed
                      ? 'bg-amber-950/80 border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-110'
                      : 'bg-slate-900 border border-slate-700 opacity-40'
                  }`}
                >
                  {cp.icon}
                </div>
                <span className={`text-[9px] sm:text-[10px] mt-1 font-semibold text-center ${isPassed ? 'text-amber-300' : 'text-slate-500'}`}>
                  {cp.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Runner Character */}
        <div
          className="absolute -top-2 transition-all duration-700 z-20"
          style={{ left: `calc(${progressRatio * 86}% + 10px)` }}
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl animate-bounce select-none">🏃‍♂️</span>
            {isCorrect === true && (
              <span className="text-[9px] font-bold text-emerald-400 bg-black/60 px-1 rounded whitespace-nowrap">
                VƯỢT ẢI THÀNH CÔNG!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
