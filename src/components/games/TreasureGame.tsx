import React, { useEffect, useState } from 'react';
import { Award, Key, Sparkles, Trophy } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface TreasureGameProps {
  correctCount: number;
  score: number;
  onApplyBonus: (points: number, label: string) => void;
  isGameFinished?: boolean;
}

export const TreasureGame: React.FC<TreasureGameProps> = ({
  correctCount,
  score,
  onApplyBonus,
  isGameFinished = false,
}) => {
  const [openedChests, setOpenedChests] = useState<number[]>([]);
  const [lastChestReward, setLastChestReward] = useState<string | null>(null);

  // Each 3 correct answers yields an eligible chest
  const chestsEarned = Math.floor(correctCount / 3);

  const handleOpenChest = (chestIdx: number) => {
    if (openedChests.includes(chestIdx)) return;

    sounds.playFanfare();
    const rewards = [
      { pts: 100, label: 'Kim Cương Xanh (+100 điểm)' },
      { pts: 150, label: 'Ngọc Lục Bảo (+150 điểm)' },
      { pts: 200, label: 'Vương Miện Vàng (+200 điểm)' },
    ];
    const reward = rewards[chestIdx % rewards.length];
    setOpenedChests([...openedChests, chestIdx]);
    setLastChestReward(reward.label);
    onApplyBonus(reward.pts, reward.label);
  };

  return (
    <div className="w-full bg-[#0E1520] border border-amber-500/40 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-amber-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">💎</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-amber-300">
              SĂN KHO BÁU TRI THỨC
            </h3>
            <p className="text-[11px] text-slate-400">
              Mỗi câu đúng nhận 1 chìa khóa 🔑. Thu thập 3 chìa để mở 1 rương báu nhận điểm thưởng thật!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Chìa khóa: <strong>{correctCount} 🔑</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Chests Line */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2">
        {[1, 2, 3, 4].map((chestNum, idx) => {
          const isEligible = chestsEarned >= chestNum || (isGameFinished && correctCount >= 3);
          const isOpened = openedChests.includes(idx);

          return (
            <div
              key={chestNum}
              className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                isOpened
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                  : isEligible
                  ? 'bg-slate-900 border-amber-500/60 shadow animate-pulse hover:border-amber-400 cursor-pointer'
                  : 'bg-slate-900/40 border-slate-800 opacity-50'
              }`}
            >
              <div className="text-3xl mb-1 select-none">
                {isOpened ? '✨ 🎁' : isEligible ? '🎁' : '🔒'}
              </div>
              <div className="text-xs font-bold text-amber-300 mb-1">
                Rương #{chestNum}
              </div>

              {isOpened ? (
                <span className="text-[10px] text-emerald-400 font-bold font-mono">ĐÃ NHẬN THƯỞNG ✓</span>
              ) : isEligible ? (
                <button
                  type="button"
                  onClick={() => handleOpenChest(idx)}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shadow active:scale-95"
                >
                  MỞ RƯƠNG
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 font-mono">Cần {chestNum * 3} 🔑</span>
              )}
            </div>
          );
        })}
      </div>

      {lastChestReward && (
        <div className="mt-3 p-2.5 bg-amber-500/20 border border-amber-500/50 rounded-xl text-center text-xs font-bold text-amber-200 animate-fadeIn">
          🎉 Chúc mừng! Bạn vừa mở rương nhận được: <strong>{lastChestReward}</strong>
        </div>
      )}
    </div>
  );
};
