import React from 'react';
import { Award, BarChart2, Coins, HelpCircle, RefreshCw, Scissors, Sparkles } from 'lucide-react';

interface MillionaireGameProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  usedLifelines: {
    fiftyFifty: boolean;
    swapQuestion: boolean;
    audiencePoll: boolean;
  };
  audiencePollData: number[] | null;
  onUseFiftyFifty: () => void;
  onUseSwapQuestion: () => void;
  onUseAudiencePoll: () => void;
}

const MONEY_TIERS = [
  '100', '200', '300', '500', '1.000',
  '2.000', '4.000', '8.000', '16.000', '32.000',
  '64.000', '125.000', '250.000', '500.000', '1.000.000'
];

export const MillionaireGame: React.FC<MillionaireGameProps> = ({
  currentIndex,
  totalQuestions,
  score,
  usedLifelines,
  audiencePollData,
  onUseFiftyFifty,
  onUseSwapQuestion,
  onUseAudiencePoll,
}) => {
  const currentTier = MONEY_TIERS[Math.min(currentIndex, MONEY_TIERS.length - 1)];

  return (
    <div className="w-full bg-[#070D1E] border border-amber-500/40 rounded-3xl p-4 sm:p-5 mb-5 shadow-2xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">💰</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-amber-300">
              AI LÀ TRIỆU PHÚ
            </h3>
            <p className="text-[11px] text-slate-400">
              Chinh phục 15 mốc thưởng và 3 quyền trợ giúp đắc lực
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/40 text-amber-300 font-bold">
            Mốc hiện tại: <span className="text-white text-sm">{currentTier} ĐIỂM</span>
          </div>
        </div>
      </div>

      {/* 3 Real Lifelines Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 my-2">
        {/* Lifeline 1: 50:50 */}
        <button
          type="button"
          onClick={onUseFiftyFifty}
          disabled={usedLifelines.fiftyFifty}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow ${
            usedLifelines.fiftyFifty
              ? 'bg-slate-900 border border-slate-800 text-slate-600 line-through cursor-not-allowed'
              : 'bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900 active:scale-95'
          }`}
          title="Loại bỏ 2 phương án sai"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>50:50 {usedLifelines.fiftyFifty && '(Đã dùng)'}</span>
        </button>

        {/* Lifeline 2: Swap Question */}
        <button
          type="button"
          onClick={onUseSwapQuestion}
          disabled={usedLifelines.swapQuestion}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow ${
            usedLifelines.swapQuestion
              ? 'bg-slate-900 border border-slate-800 text-slate-600 line-through cursor-not-allowed'
              : 'bg-purple-950/80 border border-purple-500/50 text-purple-300 hover:bg-purple-900 active:scale-95'
          }`}
          title="Đổi sang câu hỏi khác"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ĐỔI CÂU {usedLifelines.swapQuestion && '(Đã dùng)'}</span>
        </button>

        {/* Lifeline 3: Audience Poll */}
        <button
          type="button"
          onClick={onUseAudiencePoll}
          disabled={usedLifelines.audiencePoll}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow ${
            usedLifelines.audiencePoll
              ? 'bg-slate-900 border border-slate-800 text-slate-600 line-through cursor-not-allowed'
              : 'bg-amber-950/80 border border-amber-500/50 text-amber-300 hover:bg-amber-900 active:scale-95'
          }`}
          title="Hỏi ý kiến lớp / khán giả"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>HỎI LỚP {usedLifelines.audiencePoll && '(Đã dùng)'}</span>
        </button>
      </div>

      {/* Audience Poll Chart if used */}
      {audiencePollData && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 my-2 text-xs">
          <div className="text-[11px] font-bold text-amber-300 mb-2 flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>KẾT QUẢ KHẢO SÁT Ý KIẾN CẢ LỚP:</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            {['A', 'B', 'C', 'D'].map((opt, i) => (
              <div key={opt} className="bg-black/50 p-2 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Phương án {opt}</div>
                <div className="text-sm font-bold text-cyan-300 mt-0.5">{audiencePollData[i]}%</div>
                <div className="w-full h-1 bg-slate-800 rounded mt-1 overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${audiencePollData[i]}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Ladder summary */}
      <div className="flex items-center justify-between overflow-x-auto py-1 text-[10px] font-mono text-slate-500 gap-1 border-t border-slate-800/80 mt-2">
        {MONEY_TIERS.slice(0, Math.min(10, totalQuestions)).map((val, idx) => {
          const isCurrent = idx === currentIndex;
          const isPassed = idx < currentIndex;
          const isMilestone = idx === 4 || idx === 9 || idx === 14;
          return (
            <span
              key={idx}
              className={`px-1.5 py-0.5 rounded ${
                isCurrent
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : isPassed
                  ? 'text-emerald-400'
                  : isMilestone
                  ? 'text-amber-300 font-bold'
                  : 'text-slate-500'
              }`}
            >
              #{idx + 1}:{val}
            </span>
          );
        })}
      </div>
    </div>
  );
};
