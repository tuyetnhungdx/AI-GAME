import React from 'react';
import { GameType, Question } from '../../types';
import { RacingGame } from './RacingGame';
import { WheelGame } from './WheelGame';
import { BombGame } from './BombGame';
import { PuzzleGame } from './PuzzleGame';
import { SpaceGame } from './SpaceGame';
import { CastleGame } from './CastleGame';
import { TreasureGame } from './TreasureGame';
import { ArenaGame } from './ArenaGame';
import { MillionaireGame } from './MillionaireGame';
import { BalloonGame } from './BalloonGame';

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
  isCorrect?: boolean | null;
  currentQuestion?: Question;
  selectedOption?: number | null;
  correctCount?: number;
  usedLifelines?: {
    fiftyFifty: boolean;
    swapQuestion: boolean;
    audiencePoll: boolean;
  };
  audiencePollData?: number[] | null;
  onApplyBonus?: (points: number, label: string, multiplier?: number) => void;
  onSelectOption?: (idx: number) => void;
  onUseFiftyFifty?: () => void;
  onUseSwapQuestion?: () => void;
  onUseAudiencePoll?: () => void;
  onGuessSecret?: (isCorrect: boolean) => void;
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
  currentQuestion,
  selectedOption,
  correctCount = 0,
  usedLifelines = { fiftyFifty: false, swapQuestion: false, audiencePoll: false },
  audiencePollData = null,
  onApplyBonus = () => {},
  onSelectOption = () => {},
  onUseFiftyFifty = () => {},
  onUseSwapQuestion = () => {},
  onUseAudiencePoll = () => {},
  onGuessSecret = () => {},
}) => {
  switch (gameType) {
    case 'racing':
      return (
        <RacingGame
          currentScore={score}
          maxPossibleScore={totalQuestions * 200}
          streak={streak}
          playerName={playerName}
          isCorrect={isCorrect}
        />
      );

    case 'wheel':
      return (
        <WheelGame
          onApplyBonus={onApplyBonus}
          streak={streak}
          score={score}
          isQuestionAnswered={isAnswered}
        />
      );

    case 'bomb':
      return (
        <BombGame
          remainingTime={timeRemaining}
          totalTime={maxTime}
          isAnswered={isAnswered}
          isCorrect={isCorrect}
        />
      );

    case 'puzzle':
      return (
        <PuzzleGame
          unlockedTiles={correctCount}
          totalTiles={Math.max(9, totalQuestions)}
          score={score}
          onGuessSecret={onGuessSecret}
        />
      );

    case 'space':
      return (
        <SpaceGame
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          score={score}
          isCorrect={isCorrect}
        />
      );

    case 'castle':
      return (
        <CastleGame
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          score={score}
          isCorrect={isCorrect}
        />
      );

    case 'treasure':
      return (
        <TreasureGame
          correctCount={correctCount}
          score={score}
          onApplyBonus={onApplyBonus}
        />
      );

    case 'arena':
      return (
        <ArenaGame
          score={score}
          streak={streak}
          playerName={playerName}
          isCorrect={isCorrect}
        />
      );

    case 'millionaire':
      return (
        <MillionaireGame
          currentIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          score={score}
          usedLifelines={usedLifelines}
          audiencePollData={audiencePollData}
          onUseFiftyFifty={onUseFiftyFifty}
          onUseSwapQuestion={onUseSwapQuestion}
          onUseAudiencePoll={onUseAudiencePoll}
        />
      );

    case 'balloon':
      return (
        <BalloonGame
          options={currentQuestion?.options || ['A', 'B', 'C', 'D']}
          correctAnswer={currentQuestion?.correctAnswer ?? 0}
          isAnswered={isAnswered}
          selectedOption={selectedOption ?? null}
          onSelectOption={onSelectOption}
          score={score}
        />
      );

    default:
      return null;
  }
};
