import React, { useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BalloonGameProps {
  options: string[];
  correctAnswer: number;
  isAnswered: boolean;
  selectedOption: number | null;
  onSelectOption: (idx: number) => void;
  score: number;
}

const BALLOON_COLORS = [
  'from-cyan-400 to-blue-600 border-cyan-300',
  'from-purple-400 to-indigo-600 border-purple-300',
  'from-amber-400 to-orange-600 border-amber-300',
  'from-emerald-400 to-teal-600 border-emerald-300',
];

export const BalloonGame: React.FC<BalloonGameProps> = ({
  options,
  correctAnswer,
  isAnswered,
  selectedOption,
  onSelectOption,
  score,
}) => {
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null);
  const letters = ['A', 'B', 'C', 'D'];

  const handleBalloonClick = (idx: number) => {
    if (isAnswered) return;
    setPoppedIndex(idx);
    sounds.playSpinClick();
    onSelectOption(idx);
  };

  return (
    <div className="w-full bg-[#0A1224] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🎈</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-cyan-300">
              BẮN BÓNG KIẾN THỨC
            </h3>
            <p className="text-[11px] text-slate-400">
              Chạm hoặc nhấp vào quả bóng chứa đáp án chính xác để nổ bóng và ghi điểm!
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-amber-300 bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
          Điểm: <strong>{score}</strong>
        </div>
      </div>

      {/* Floating Balloons Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3">
        {options.map((optText, idx) => {
          const isSelected = selectedOption === idx;
          const isTheRightOne = isAnswered && idx === correctAnswer;
          const isTheWrongOne = isAnswered && isSelected && idx !== correctAnswer;
          const isPopped = poppedIndex === idx && isAnswered;

          return (
            <div
              key={idx}
              onClick={() => handleBalloonClick(idx)}
              className={`flex flex-col items-center cursor-pointer select-none transition-all duration-300 ${
                isAnswered ? 'cursor-default' : 'hover:-translate-y-2 active:scale-95'
              }`}
            >
              {/* Balloon Graphic */}
              <div
                className={`w-20 h-24 sm:w-24 sm:h-28 rounded-full bg-gradient-to-tr border-2 shadow-xl flex flex-col items-center justify-center p-2 text-center transition-all duration-500 relative ${
                  isTheRightOne
                    ? 'scale-110 shadow-[0_0_25px_rgba(52,211,153,0.8)] border-emerald-300 bg-gradient-to-tr from-emerald-500 to-teal-400'
                    : isTheWrongOne
                    ? 'scale-90 opacity-60 border-rose-500 bg-gradient-to-tr from-rose-600 to-pink-700 animate-pulse'
                    : BALLOON_COLORS[idx % BALLOON_COLORS.length]
                }`}
              >
                {/* Balloon string knot */}
                <div className="absolute -bottom-2 w-3 h-2 bg-slate-400 rounded-b"></div>

                {/* Letter badge */}
                <span className="w-6 h-6 rounded-full bg-black/40 text-white font-black text-xs flex items-center justify-center mb-1">
                  {letters[idx]}
                </span>

                <span className="text-[10px] sm:text-xs font-bold text-white line-clamp-2 leading-tight">
                  {optText}
                </span>

                {isTheRightOne && (
                  <span className="absolute -top-3 text-xs bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black animate-bounce">
                    ✓ NỔ BÓNG!
                  </span>
                )}
              </div>

              {/* String tail */}
              <div className="w-[1px] h-6 bg-slate-600 opacity-60 mt-2"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
