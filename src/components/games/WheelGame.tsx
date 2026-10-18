import React, { useState } from 'react';
import { Award, RotateCw, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface WheelGameProps {
  onSpinBonus?: (multiplier: number, bonusLabel: string) => void;
  streak: number;
  score: number;
}

const SECTORS = [
  { label: '+100 ĐIỂM', color: '#06B6D4', points: 100 },
  { label: 'NHÂN ĐÔI X2', color: '#8B5CF6', points: 200 },
  { label: '+200 ĐIỂM', color: '#F59E0B', points: 200 },
  { label: 'CÂU BÍ MẬT', color: '#10B981', points: 150 },
  { label: '+50 MAY MẮN', color: '#EC4899', points: 50 },
  { label: 'COMBO X3', color: '#3B82F6', points: 300 },
];

export const WheelGame: React.FC<WheelGameProps> = ({ onSpinBonus, streak, score }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<string | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sounds.playSpinClick();

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    const newRotation = rotation + randomDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedDegree = (360 - (newRotation % 360)) % 360;
      const sectorIndex = Math.floor(normalizedDegree / (360 / SECTORS.length)) % SECTORS.length;
      const sector = SECTORS[sectorIndex];
      setLastReward(sector.label);
      sounds.playCorrect();
      if (onSpinBonus) {
        onSpinBonus(sector.points, sector.label);
      }
    }, 3200);
  };

  return (
    <div className="w-full bg-[#071324] border border-purple-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-purple-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎡</span>
          <div>
            <h3 className="font-bold text-base md:text-lg text-purple-300">VÒNG QUAY MAY MẮN</h3>
            <p className="text-xs text-slate-400">Quay để nhận điểm thưởng đặc biệt và câu hỏi cơ hội!</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-300">
            Điểm: <strong>{score}</strong>
          </div>
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-purple-500/30 text-amber-300">
            Streak: <strong>{streak} 🔥</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-2">
        {/* The Wheel */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 z-20 text-amber-400 text-2xl filter drop-shadow">
            ▼
          </div>

          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-transform ease-out relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '3.2s' : '0s',
              background: `conic-gradient(
                #06B6D4 0deg 60deg,
                #8B5CF6 60deg 120deg,
                #F59E0B 120deg 180deg,
                #10B981 180deg 240deg,
                #EC4899 240deg 300deg,
                #3B82F6 300deg 360deg
              )`,
            }}
          >
            {SECTORS.map((sec, idx) => {
              const angle = idx * 60 + 30;
              return (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white select-none pointer-events-none drop-shadow"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-60px)`,
                  }}
                >
                  {sec.label}
                </div>
              );
            })}
          </div>

          {/* Center Hub */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-10 w-14 h-14 rounded-full bg-[#0B1524] border-2 border-amber-400 text-amber-300 font-bold text-xs flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-75"
          >
            <RotateCw className={`w-4 h-4 mb-0.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>QUAY</span>
          </button>
        </div>

        {/* Wheel Status & Trigger */}
        <div className="text-center md:text-left space-y-3 max-w-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-purple-500/30">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Phần thưởng lượt quay vừa rồi:</span>
            </div>
            <div className="text-lg font-bold text-amber-300">
              {lastReward || 'Chưa quay – Bấm nút QUAY ở giữa!'}
            </div>
          </div>
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Award className="w-4 h-4" />
            {isSpinning ? 'Đang quay may mắn...' : 'Quay Vòng May Mắn'}
          </button>
        </div>
      </div>
    </div>
  );
};
