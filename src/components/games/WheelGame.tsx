import React, { useState } from 'react';
import { Award, RotateCw, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface WheelGameProps {
  onApplyBonus: (points: number, label: string, multiplier?: number) => void;
  streak: number;
  score: number;
  isQuestionAnswered?: boolean;
}

interface WheelSector {
  label: string;
  points: number;
  multiplier?: number;
  color: string;
  description: string;
}

const SECTORS: WheelSector[] = [
  { label: '+100 ĐIỂM', points: 100, color: '#06B6D4', description: 'Cộng trực tiếp +100 điểm vào tài khoản!' },
  { label: 'NHÂN ĐÔI X2', points: 0, multiplier: 2, color: '#8B5CF6', description: 'Điểm số của câu hỏi tiếp theo sẽ được nhân đôi X2!' },
  { label: '+200 ĐIỂM', points: 200, color: '#F59E0B', description: 'Phần thưởng cực lớn +200 điểm may mắn!' },
  { label: 'CÂU BÍ MẬT', points: 50, color: '#10B981', description: 'Mở khóa câu hỏi bí mật và nhận +50 điểm!' },
  { label: '+50 MAY MẮN', points: 50, color: '#EC4899', description: 'Nhận ngay +50 điểm động viên!' },
  { label: 'MẤT LƯỢT QUAY', points: 0, color: '#64748B', description: 'Ôi không! Hãy cố gắng ở lượt sau nhé, vẫn được làm câu hỏi!' },
  { label: 'CÂU HỎI KHÓ', points: 150, color: '#3B82F6', description: 'Thử thách trí tuệ: Thưởng +150 điểm nếu giải đúng!' },
  { label: 'COMBO X3', points: 0, multiplier: 3, color: '#E11D48', description: 'Siêu may mắn: Điểm câu tiếp theo nhân 3!' },
];

export const WheelGame: React.FC<WheelGameProps> = ({
  onApplyBonus,
  streak,
  score,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedReward, setSelectedReward] = useState<WheelSector | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sounds.playSpinClick();

    // Pick target sector first
    const targetIndex = Math.floor(Math.random() * SECTORS.length);
    const sectorAngle = 360 / SECTORS.length;
    
    // Add 4-6 full rotations + offset for the sector
    // Pointer is at top (270 deg or 0 deg). With pointer at top, offset is:
    const baseRotations = 1440 + Math.floor(Math.random() * 720);
    const targetAngle = 360 - (targetIndex * sectorAngle + sectorAngle / 2);
    const totalRotation = rotation + baseRotations + targetAngle;

    setRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const sector = SECTORS[targetIndex];
      setSelectedReward(sector);
      sounds.playCorrect();

      // Apply real points or multiplier to the game engine
      onApplyBonus(sector.points, sector.label, sector.multiplier || 1);
    }, 3200);
  };

  const sectorAngle = 360 / SECTORS.length;

  return (
    <div className="w-full bg-[#071324] border border-purple-500/30 rounded-3xl p-4 sm:p-5 mb-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-purple-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-float">🎡</span>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-purple-300">
              VÒNG QUAY MAY MẮN
            </h3>
            <p className="text-[11px] text-slate-400">
              Quay vòng để nhận điểm thưởng, nhân đôi X2 hoặc câu hỏi đặc biệt!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="bg-slate-900 px-3 py-1 rounded-xl border border-purple-500/30 text-amber-300">
            Điểm: <strong>{score}</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* Wheel graphic */}
        <div className="relative w-56 h-56 flex items-center justify-center flex-shrink-0">
          {/* Pointer Arrow */}
          <div className="absolute -top-3.5 z-20 text-amber-400 text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            ▼
          </div>

          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-transform ease-out relative overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '3.2s' : '0s',
              background: `conic-gradient(
                #06B6D4 0deg 45deg,
                #8B5CF6 45deg 90deg,
                #F59E0B 90deg 135deg,
                #10B981 135deg 180deg,
                #EC4899 180deg 225deg,
                #64748B 225deg 270deg,
                #3B82F6 270deg 315deg,
                #E11D48 315deg 360deg
              )`,
            }}
          >
            {SECTORS.map((sec, idx) => {
              const angle = idx * sectorAngle + sectorAngle / 2;
              return (
                <div
                  key={idx}
                  className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white select-none pointer-events-none drop-shadow"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-66px)`,
                  }}
                >
                  {sec.label}
                </div>
              );
            })}
          </div>

          {/* Center Hub Button */}
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-10 w-14 h-14 rounded-full bg-[#0B1524] border-2 border-amber-400 text-amber-300 font-bold text-xs flex flex-col items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-75"
          >
            <RotateCw className={`w-4 h-4 mb-0.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>QUAY</span>
          </button>
        </div>

        {/* Reward Status Card */}
        <div className="space-y-3 max-w-sm text-center sm:text-left flex-1">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-purple-500/30">
            <div className="text-xs text-slate-400 mb-1 flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Kết quả lượt quay:</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-300">
              {selectedReward ? selectedReward.label : 'Chưa quay – Bấm nút QUAY ở giữa bánh xe!'}
            </div>
            {selectedReward && (
              <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                {selectedReward.description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>{isSpinning ? 'Đang quay bánh xe may mắn...' : 'Quay bánh xe thưởng điểm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
