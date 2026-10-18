import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface BombGameProps {
  timeRemaining: number;
  maxTime: number;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export const BombGame: React.FC<BombGameProps> = ({
  timeRemaining,
  maxTime,
  isAnswered,
  isCorrect,
}) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (timeRemaining <= 5 && !isAnswered) {
      sounds.playTick();
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 300);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isAnswered]);

  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / maxTime) * 100));

  return (
    <div className="w-full bg-[#0F101A] border border-rose-500/40 rounded-2xl p-4 md:p-6 mb-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💣</span>
          <div>
            <h3 className="font-bold text-base md:text-lg text-rose-300 flex items-center gap-2">
              GỠ BOM KIẾN THỨC
              {timeRemaining <= 5 && !isAnswered && (
                <span className="text-xs bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full animate-bounce">
                  KHẨN CẤP!
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Chọn đúng dây nối (đáp án chính xác) trước khi ngòi nổ kích hoạt!</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-sm bg-rose-950/60 border border-rose-500/40 px-3 py-1.5 rounded-xl">
          <Clock className={`w-4 h-4 ${timeRemaining <= 5 ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
          <span className={`font-bold ${timeRemaining <= 5 ? 'text-rose-400 text-base' : 'text-slate-200'}`}>
            00:{timeRemaining.toString().padStart(2, '0')}s
          </span>
        </div>
      </div>

      {/* Bomb visual & Wire station */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-3">
        {/* Cartoon Bomb Graphic */}
        <div className="relative flex flex-col items-center">
          {/* Fuse & Spark */}
          <div className="relative w-8 h-8 flex justify-center items-end">
            <div className="w-1.5 h-6 bg-amber-700 rounded-t-full relative">
              {!isAnswered && (
                <div className="absolute -top-3 -right-2 text-amber-400 animate-ping text-xs">
                  ✨
                </div>
              )}
            </div>
          </div>

          {/* Bomb body */}
          <div
            className={`w-28 h-28 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 border-4 border-slate-700 flex flex-col items-center justify-center shadow-2xl relative transition-all duration-300 ${
              pulse ? 'scale-110 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]' : ''
            }`}
          >
            {/* Digital Timer Face */}
            <div className="bg-black/90 px-3 py-1 rounded border border-rose-500/40 font-mono font-bold text-rose-500 text-sm tracking-wider">
              {timeRemaining.toFixed(1)}s
            </div>

            {/* Spark indicator */}
            {isAnswered && isCorrect && (
              <div className="absolute inset-0 bg-emerald-950/80 rounded-full flex flex-col items-center justify-center border-2 border-emerald-400 text-emerald-300 font-bold text-xs p-1 text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mb-0.5" />
                GỠ BOM THÀNH CÔNG!
              </div>
            )}

            {isAnswered && !isCorrect && (
              <div className="absolute inset-0 bg-rose-950/90 rounded-full flex flex-col items-center justify-center border-2 border-rose-500 text-rose-300 font-bold text-xs p-1 text-center">
                <AlertTriangle className="w-6 h-6 text-rose-400 mb-0.5" />
                NGÒI NỔ ĐÃ KÍCH HOẠT!
              </div>
            )}
          </div>
        </div>

        {/* Status text & Fuse Bar */}
        <div className="flex-1 max-w-sm space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Ngòi nổ kiến thức:</span>
            <span className="font-mono text-rose-300">{progressPercent.toFixed(0)}% an toàn</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent > 50
                  ? 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Mỗi phương án tương ứng một dây kích nổ: Chọn đáp án đúng bên dưới để vô hiệu hóa an toàn!</span>
          </p>
        </div>
      </div>
    </div>
  );
};
