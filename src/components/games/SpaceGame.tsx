import React from 'react';
import { Rocket, Sparkles, Star } from 'lucide-react';

interface SpaceGameProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
}

const PLANETS = [
  { name: 'Trái Đất', emoji: '🌍' },
  { name: 'Mặt Trăng', emoji: '🌕' },
  { name: 'Sao Hỏa', emoji: '🪐' },
  { name: 'Sao Mộc', emoji: '⭐' },
  { name: 'Dải Ngân Hà', emoji: '🌌' },
];

export const SpaceGame: React.FC<SpaceGameProps> = ({
  currentQuestionIndex,
  totalQuestions,
  score,
}) => {
  const progressRatio = Math.min(1, currentQuestionIndex / Math.max(1, totalQuestions));
  const currentPlanetIndex = Math.min(PLANETS.length - 1, Math.floor(progressRatio * PLANETS.length));

  return (
    <div className="w-full bg-[#050814] border border-indigo-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <div>
            <h3 className="font-bold text-base md:text-lg text-indigo-300">CHINH PHỤC VŨ TRỤ KIẾN THỨC</h3>
            <p className="text-xs text-slate-400">Điều khiển phi thuyền không gian vượt qua các hành tinh tri thức!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-indigo-950/70 px-3 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-300">
          <span>Điểm viễn chinh: <strong>{score}</strong></span>
        </div>
      </div>

      {/* Orbit path */}
      <div className="relative py-4">
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 rounded-full -translate-y-1/2"></div>
        <div className="flex justify-between items-center relative z-10 px-2">
          {PLANETS.map((planet, idx) => {
            const isReached = idx <= currentPlanetIndex;
            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-500 ${
                    isReached
                      ? 'scale-110 bg-indigo-900 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                      : 'opacity-40 bg-slate-900 border border-slate-700'
                  }`}
                >
                  {planet.emoji}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isReached ? 'text-cyan-300' : 'text-slate-500'}`}>
                  {planet.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spaceship pointer */}
        <div
          className="absolute -top-1 transition-all duration-700 z-20"
          style={{ left: `calc(${progressRatio * 86}% + 12px)` }}
        >
          <div className="animate-bounce">
            <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">🚀</span>
          </div>
        </div>
      </div>
    </div>
  );
};
