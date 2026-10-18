import React, { useState } from 'react';
import { Eye, HelpCircle, Lock, Sparkles, Unlock } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface PuzzleGameProps {
  unlockedTiles: number;
  totalTiles?: number;
  score: number;
  onGuessSecret?: (isCorrect: boolean) => void;
  isGameFinished?: boolean;
}

export const PuzzleGame: React.FC<PuzzleGameProps> = ({
  unlockedTiles,
  totalTiles = 9,
  score,
  onGuessSecret,
  isGameFinished = false,
}) => {
  const [showGuessModal, setShowGuessModal] = useState<boolean>(false);
  const [guessInput, setGuessInput] = useState<string>('');
  const [hasGuessedCorrect, setHasGuessedCorrect] = useState<boolean>(false);
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);

  const tiles = Array.from({ length: totalTiles }, (_, i) => i);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGuess = guessInput.trim().toLowerCase();
    // Keywords accepted: "trí tuệ nhân tạo", "ai", "máy tính", "công nghệ", "robot", "kỷ nguyên số"
    if (
      cleanGuess.includes('ai') ||
      cleanGuess.includes('trí tuệ nhân tạo') ||
      cleanGuess.includes('máy tính') ||
      cleanGuess.includes('công nghệ') ||
      cleanGuess.includes('robot')
    ) {
      setHasGuessedCorrect(true);
      setGuessFeedback('🎉 CHÍNH XÁC! Bạn đã đoán đúng bức tranh bí mật và nhận +300 điểm thưởng!');
      sounds.playFanfare();
      if (onGuessSecret) onGuessSecret(true);
      setTimeout(() => setShowGuessModal(false), 2000);
    } else {
      setGuessFeedback('Chưa chính xác! Hãy mở thêm mảnh ghép ở các câu hỏi tiếp theo để quan sát rõ hơn nhé.');
      sounds.playWrong();
    }
  };

  return (
    <div className="w-full bg-[#071426] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🧩</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-cyan-300">
              LẬT MẢNH GHÉP BÍ ẨN
            </h3>
            <p className="text-[11px] text-slate-400">
              Trả lời đúng để lật mở từng mảnh ghép công nghệ và đoán nội dung bức tranh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => setShowGuessModal(true)}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ĐOÁN HÌNH (+300đ)</span>
          </button>
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-slate-700 text-amber-300">
            Mảnh mở: <strong>{isGameFinished || hasGuessedCorrect ? totalTiles : unlockedTiles}/{totalTiles}</strong>
          </div>
        </div>
      </div>

      {/* 9 Tiles Matrix Area */}
      <div className="relative max-w-sm mx-auto h-52 sm:h-56 rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-inner bg-slate-950 flex items-center justify-center">
        {/* Secret Underlying Illustration */}
        <div
          className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center p-4 text-center select-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #1e1b4b 0%, #030712 100%)`,
          }}
        >
          <div className="text-4xl mb-1 animate-pulse">🤖 🌐 💻</div>
          <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-amber-300">
            TRÍ TUỆ NHÂN TẠO & MẠNG KẾT NỐI
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            THPT NGUYỄN DỤC – CHUYỂN ĐỔI SỐ
          </div>
        </div>

        {/* 3x3 Tile Grid Covering the Secret Image */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-1">
          {tiles.map((idx) => {
            const isRevealed = isGameFinished || hasGuessedCorrect || idx < unlockedTiles;
            return (
              <div
                key={idx}
                className={`relative rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-700 select-none ${
                  isRevealed
                    ? 'opacity-0 scale-75 pointer-events-none'
                    : 'bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 border border-cyan-500/30 text-cyan-300 shadow'
                }`}
              >
                {!isRevealed && (
                  <div className="flex flex-col items-center gap-0.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400/80" />
                    <span className="text-[10px] font-mono">#{idx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Guess Modal */}
      {showGuessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1728] border-2 border-amber-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative">
            <h3 className="font-extrabold text-base text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ĐOÁN BỨC TRANH BÍ MẬT
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Nhập từ khóa chủ đề của bức tranh (Ví dụ: Trí tuệ nhân tạo, AI, Mạng máy tính). Đúng nhận ngay <strong className="text-amber-300">+300 điểm!</strong>
            </p>

            <form onSubmit={handleGuessSubmit} className="space-y-3">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Nhập suy đoán của em..."
                className="w-full bg-[#060D17] border border-slate-700 focus:border-amber-400 text-white p-3 rounded-xl text-xs sm:text-sm outline-none"
                autoFocus
              />

              {guessFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    hasGuessedCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {guessFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuessModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow active:scale-95 transition-all"
                >
                  Xác nhận đoán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
