import React from 'react';
import { AlertTriangle, Clock, ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface BombGameProps {
  remainingTime: number;
  totalTime: number;
  isAnswered: boolean;
  isCorrect?: boolean | null;
}

export const BombGame: React.FC<BombGameProps> = ({
  remainingTime,
  totalTime = 20,
  isAnswered,
  isCorrect,
}) => {
  const isVibrating = remainingTime <= 5 && !isAnswered;
  const progressRatio = Math.max(0, Math.min(100, (remainingTime / Math.max(1, totalTime)) * 100));

  return (
    <div className="w-full bg-[#0F101A] border border-rose-500/40 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-rose-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">💣</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-rose-300 flex items-center gap-2">
              GỠ BOM KIẾN THỨC
              {isVibrating && (
                <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.2 rounded-full animate-bounce">
                  KHẨN CẤP!
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Đồng hồ điện tử đếm ngược – Cắt đúng dây (chọn đáp án đúng) để vô hiệu hóa an toàn!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-rose-950/70 border border-rose-500/40 px-3 py-1 rounded-xl">
          <Clock className={`w-3.5 h-3.5 ${isVibrating ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
          <span className={`font-bold ${isVibrating ? 'text-rose-400 text-sm' : 'text-slate-200'}`}>
            00:{remainingTime.toString().padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Bomb visual & Status */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Friendly cartoon bomb */}
        <div className="relative flex flex-col items-center">
          {/* Fuse & Spark */}
          <div className="relative w-8 h-7 flex justify-center items-end">
            <div className="w-1.5 h-5 bg-amber-700 rounded-t-full relative">
              {!isAnswered && (
                <span className="absolute -top-3 -right-2 text-amber-300 animate-ping text-xs select-none">
                  ✨
                </span>
              )}
            </div>
          </div>

          {/* Bomb body */}
          <div
            className={`w-28 h-28 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-4 border-slate-700 flex flex-col items-center justify-center shadow-2xl relative transition-all duration-300 ${
              isVibrating ? 'scale-105 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse' : ''
            }`}
          >
            {/* Digital Timer Face */}
            <div className="bg-black/90 px-3 py-1 rounded border border-rose-500/50 font-mono font-black text-rose-400 text-sm tracking-wider">
              {remainingTime.toString().padStart(2, '0')}s
            </div>

            {/* Answered State Overlays */}
            {isAnswered && isCorrect === true && (
              <div className="absolute inset-0 bg-emerald-950/90 rounded-full flex flex-col items-center justify-center border-2 border-emerald-400 text-emerald-300 font-extrabold text-xs p-1 text-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-0.5" />
                <span>GỠ BOM THÀNH CÔNG!</span>
                <span className="text-[10px] text-emerald-400">✅ SAFE</span>
              </div>
            )}

            {isAnswered && isCorrect === false && (
              <div className="absolute inset-0 bg-rose-950/95 rounded-full flex flex-col items-center justify-center border-2 border-rose-500 text-rose-300 font-extrabold text-xs p-1 text-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-rose-400 mb-0.5" />
                <span>Ôi! Chưa đúng rồi!</span>
                <span className="text-[10px] text-rose-400">💨 Khói xì nhẹ</span>
              </div>
            )}
          </div>
        </div>

        {/* Status text & Fuse Bar */}
        <div className="flex-1 max-w-sm space-y-2 text-center sm:text-left">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Độ an toàn của kíp nổ:</span>
            <span className="font-mono text-rose-300 font-bold">{progressRatio.toFixed(0)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-1000 ${
                progressRatio > 40
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600'
              }`}
              style={{ width: `${progressRatio}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Mỗi phương án A, B, C, D là một dây ngòi nổ. Chọn đáp án chuẩn xác để vô hiệu hóa an toàn!</span>
          </p>
        </div>
      </div>
    </div>
  );
};
