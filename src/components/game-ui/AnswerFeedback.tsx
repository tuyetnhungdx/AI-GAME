import React from 'react';
import { ArrowRight, CheckCircle2, Lightbulb, Sparkles, XCircle } from 'lucide-react';
import { ScoreBreakdown } from '../../lib/game/scoring';
import { Question } from '../../types';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  scoreBreakdown: ScoreBreakdown | null;
  question: Question;
  isLastQuestion: boolean;
  onNext: () => void;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  scoreBreakdown,
  question,
  isLastQuestion,
  onNext,
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const correctLetter = letters[question.correctAnswer];
  const correctText = question.options[question.correctAnswer];

  return (
    <div
      className={`p-4 sm:p-5 rounded-3xl border mb-5 transition-all shadow-xl animate-fadeIn ${
        isCorrect
          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-100 shadow-[0_0_25px_rgba(52,211,153,0.15)]'
          : 'bg-rose-950/60 border-rose-500/50 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
      }`}
    >
      {/* Title & Score Awarded */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-300">🎉 CHÍNH XÁC!</span>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-rose-400" />
              <span className="text-rose-300">CHƯA CHÍNH XÁC</span>
            </>
          )}
        </div>

        {isCorrect && scoreBreakdown && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
              +{scoreBreakdown.totalAwarded} điểm
            </span>
          </div>
        )}
      </div>

      {/* Score breakdown chips */}
      {isCorrect && scoreBreakdown && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-emerald-300/80 mb-2">
          <span>Cơ bản: +{scoreBreakdown.baseScore}</span>
          {scoreBreakdown.speedBonus > 0 && (
            <span>• Tốc độ: +{scoreBreakdown.speedBonus}</span>
          )}
          {scoreBreakdown.streakBonus > 0 && (
            <span className="text-amber-300 font-bold">• Chuỗi đúng: +{scoreBreakdown.streakBonus} 🔥</span>
          )}
        </div>
      )}

      {/* Correct answer revelation if wrong */}
      {!isCorrect && (
        <div className="p-3 bg-black/40 rounded-xl border border-rose-500/30 text-xs sm:text-sm space-y-1 mb-2">
          <div className="text-rose-300 font-medium">
            Đáp án đúng: <strong className="text-white underline font-bold">{correctLetter}. {correctText}</strong>
          </div>
        </div>
      )}

      {/* Explanation text */}
      {question.explanation && (
        <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Giải thích:</strong> {question.explanation}
          </div>
        </div>
      )}

      {/* Advance button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <span>{isLastQuestion ? 'XEM KẾT QUẢ CUỐI CÙNG' : 'CÂU TIẾP THEO'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
