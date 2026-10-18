import React from 'react';
import { GameType } from '../../types';
import { RacingGame } from './RacingGame';
import { WheelGame } from './WheelGame';
import { BombGame } from './BombGame';
import { PuzzleGame } from './PuzzleGame';
import { SpaceGame } from './SpaceGame';

interface GameVisualBannerProps {
  gameType: GameType;
  currentQuestionIndex: number;
  totalQuestions: number;
  streak: number;
  score: number;
  playerName: string;
  timeRemaining: number;
  maxTime: number;
  isAnswered: boolean;
  isCorrect?: boolean;
}

export const GameVisualBanner: React.FC<GameVisualBannerProps> = ({
  gameType,
  currentQuestionIndex,
  totalQuestions,
  streak,
  score,
  playerName,
  timeRemaining,
  maxTime,
  isAnswered,
  isCorrect,
}) => {
  switch (gameType) {
    case 'racing':
      return (
        <RacingGame
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          streak={streak}
          score={score}
          playerName={playerName}
          isNitroActive={streak >= 3}
        />
      );

    case 'wheel':
      return (
        <WheelGame
          streak={streak}
          score={score}
        />
      );

    case 'bomb':
      return (
        <BombGame
          timeRemaining={timeRemaining}
          maxTime={maxTime}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
        />
      );

    case 'puzzle':
      return (
        <PuzzleGame
          unlockedTiles={currentQuestionIndex}
          totalTiles={Math.max(9, totalQuestions)}
          score={score}
        />
      );

    case 'space':
      return (
        <SpaceGame
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          score={score}
        />
      );

    case 'castle':
      return (
        <div className="w-full bg-[#081726] border border-amber-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏰</span>
              <div>
                <h3 className="font-bold text-amber-300">VƯỢT CHƯỚNG NGẠI VẬT</h3>
                <p className="text-xs text-slate-400">Vượt qua các ải: Cầu treo, Núi hiểm, Cổng thành</p>
              </div>
            </div>
            <div className="text-xs font-mono text-amber-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              Ải {currentQuestionIndex + 1}/{totalQuestions}
            </div>
          </div>
          <div className="h-16 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-around px-4 relative overflow-hidden">
            <span className="text-2xl">🏃‍♂️</span>
            <span className="text-2xl">🌉</span>
            <span className="text-2xl">⛰️</span>
            <span className="text-2xl">🚪</span>
            <span className="text-3xl">🏰</span>
            <div
              className="absolute bottom-1 h-1 bg-amber-400 rounded transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`, left: 0 }}
            ></div>
          </div>
        </div>
      );

    case 'treasure':
      return (
        <div className="w-full bg-[#0E1520] border border-amber-500/40 rounded-2xl p-4 md:p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div>
                <h3 className="font-bold text-amber-300">SĂN KHO BÁU TRI THỨC</h3>
                <p className="text-xs text-slate-400">Thu thập chìa khóa vàng để mở hòm kho báu số!</p>
              </div>
            </div>
            <div className="text-xs font-mono text-amber-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              Chìa khóa: {currentQuestionIndex} 🗝️
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="flex items-center gap-2 text-2xl">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className={i < currentQuestionIndex ? 'opacity-100 scale-110' : 'opacity-25 grayscale'}>
                  🗝️
                </span>
              ))}
            </div>
            <span className="text-4xl animate-bounce">🎁</span>
          </div>
        </div>
      );

    case 'arena':
      return (
        <div className="w-full bg-[#140C20] border border-rose-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-rose-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <h3 className="font-bold text-rose-300">ĐẤU TRƯỜNG KIẾN THỨC (ĐỘI ĐỎ vs ĐỘI XANH)</h3>
                <p className="text-xs text-slate-400">Năng lượng đồng đội – Trả lời đúng để đẩy lùi đối thủ!</p>
              </div>
            </div>
            <div className="text-xs font-mono text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
              Điểm: {score}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-rose-400">ĐỘI ĐỎ (BẠN): {score + 350}</span>
              <span className="text-cyan-400">ĐỘI XANH: 620</span>
            </div>
            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: '65%' }}></div>
              <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: '35%' }}></div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
