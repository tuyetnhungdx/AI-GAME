import React from 'react';
import { Rocket, Sparkles, Star } from 'lucide-react';

interface SpaceGameProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  isCorrect?: boolean | null;
  isGameFinished?: boolean;
}

const PLANETS = [
  { name: 'Trái Đất', emoji: '🌍', desc: 'Trạm khởi hành' },
  { name: 'Mặt Trăng', emoji: '🌕', desc: 'Vệ tinh tri thức' },
  { name: 'Sao Hỏa', emoji: '🪐', desc: 'Hành tinh đỏ' },
  { name: 'Sao Mộc', emoji: '⭐', desc: 'Khổng lồ khí' },
  { name: 'Sao Thổ', emoji: '🪐', desc: 'Vành đai sao' },
  { name: 'Thiên hà cuối', emoji: '🌌', desc: 'Đích đến vũ trụ' },
];

export const SpaceGame: React.FC<SpaceGameProps> = ({
  currentQuestionIndex,
  totalQuestions,
  score,
  isCorrect,
  isGameFinished = false,
}) => {
  const progressRatio = Math.min(1, Math.max(0, currentQuestionIndex / Math.max(1, totalQuestions)));
  const currentPlanetIndex = Math.min(PLANETS.length - 1, Math.floor(progressRatio * PLANETS.length));

  return (
    <div className="w-full bg-[#050814] border border-indigo-500/30 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-indigo-500/20 pb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🚀</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-indigo-300 flex items-center gap-2">
              CHINH PHỤC VŨ TRỤ
              {isGameFinished && (
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.2 rounded-full">
                  HOÀN THÀNH NHIỆM VỤ
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Mỗi câu đúng đưa phi thuyền không gian tiến đến hành tinh tiếp theo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-indigo-950/80 px-3 py-1 rounded-xl border border-indigo-500/40 text-cyan-300">
            Hành trình: <strong>{PLANETS[currentPlanetIndex].name}</strong>
          </div>
        </div>
      </div>

      {/* Orbit Galaxy Track */}
      <div className="relative py-6 z-10">
        {/* Glowing orbit line */}
        <div className="absolute top-1/2 left-6 right-6 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-full -translate-y-1/2 shadow-[0_0_10px_rgba(139,92,246,0.6)]"></div>

        {/* Planet milestones */}
        <div className="flex justify-between items-center relative z-10 px-2">
          {PLANETS.map((planet, idx) => {
            const isReached = isGameFinished || idx <= currentPlanetIndex;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all duration-500 ${
                    isReached
                      ? 'scale-110 bg-indigo-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                      : 'opacity-35 bg-slate-900 border border-slate-700'
                  }`}
                >
                  {planet.emoji}
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] mt-1.5 font-bold tracking-tight text-center ${
                    isReached ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  {planet.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Moving Spaceship */}
        <div
          className="absolute -top-1 transition-all duration-700 ease-out z-20"
          style={{ left: `calc(${progressRatio * 84}% + 12px)` }}
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl filter drop-shadow-[0_0_10px_rgba(244,63,94,0.9)] animate-bounce select-none">
              🚀
            </span>
            {isCorrect === true && (
              <span className="text-[10px] font-mono font-black text-amber-300 bg-black/60 px-1 rounded shadow">
                +100
              </span>
            )}
            {isCorrect === false && (
              <span className="text-[9px] text-slate-400 bg-black/70 px-1 rounded whitespace-nowrap">
                Thử tiếp ở câu sau!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
