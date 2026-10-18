import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnswerButtonProps {
  letter: string; // 'A', 'B', 'C', 'D'
  text: string;
  index: number;
  isAnswered: boolean;
  isSelected: boolean;
  isCorrectOption: boolean;
  isEliminated?: boolean;
  onClick: () => void;
}

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  letter,
  text,
  index,
  isAnswered,
  isSelected,
  isCorrectOption,
  isEliminated = false,
  onClick,
}) => {
  const isRightChoice = isAnswered && isCorrectOption;
  const isWrongChoice = isAnswered && isSelected && !isCorrectOption;

  // Color schemes for default A, B, C, D
  const colorThemes = [
    'border-cyan-500/30 bg-cyan-950/20 text-cyan-200 hover:border-cyan-400',
    'border-purple-500/30 bg-purple-950/20 text-purple-200 hover:border-purple-400',
    'border-amber-500/30 bg-amber-950/20 text-amber-200 hover:border-amber-400',
    'border-emerald-500/30 bg-emerald-950/20 text-emerald-200 hover:border-emerald-400',
  ];

  let stateClasses = colorThemes[index % colorThemes.length];

  if (isEliminated) {
    stateClasses = 'opacity-20 border-slate-800 bg-slate-900/20 text-slate-600 line-through pointer-events-none cursor-not-allowed';
  } else if (isAnswered) {
    if (isRightChoice) {
      stateClasses = 'bg-emerald-900/60 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-[1.01]';
    } else if (isWrongChoice) {
      stateClasses = 'bg-rose-950/60 border-2 border-rose-500 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
    } else {
      stateClasses = 'opacity-40 border-slate-800 bg-slate-900/40 text-slate-500 cursor-default';
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isAnswered || isEliminated}
      aria-label={`Đáp án ${letter}: ${text}`}
      className={`min-h-[52px] sm:min-h-[58px] p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 select-none active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${stateClasses}`}
    >
      {/* Letter badge */}
      <span
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0 transition-colors ${
          isRightChoice
            ? 'bg-emerald-400 text-slate-950 shadow'
            : isWrongChoice
            ? 'bg-rose-500 text-white'
            : 'bg-slate-800 text-slate-200'
        }`}
      >
        {letter}
      </span>

      {/* Answer text */}
      <span className="flex-1 text-sm sm:text-base font-medium leading-snug pt-0.5 break-words">
        {text}
      </span>

      {/* Right / Wrong indicator */}
      {isRightChoice && (
        <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="hidden sm:inline">Đúng ✓</span>
        </span>
      )}
      {isWrongChoice && (
        <span className="flex items-center gap-1 text-rose-400 font-bold text-xs flex-shrink-0 mt-0.5">
          <XCircle className="w-5 h-5" />
          <span className="hidden sm:inline">Sai ✕</span>
        </span>
      )}
    </button>
  );
};
