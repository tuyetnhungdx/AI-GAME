import React from 'react';
import { Game, Participant, ParticipantAnswer, Room } from '../../types';
import { useGameEngine } from '../../hooks/useGameEngine';
import { AnswerButton } from '../game-ui/AnswerButton';
import { AnswerFeedback } from '../game-ui/AnswerFeedback';
import { QuestionCard } from '../game-ui/QuestionCard';
import { ScoreHud } from '../game-ui/ScoreHud';
import { TimerBar } from '../game-ui/TimerBar';
import { GameVisualBanner } from '../games/GameVisualBanner';

interface GamePlayScreenProps {
  room: Room;
  participant: Participant;
  onFinishGame: (finalScore: number, answers: ParticipantAnswer[]) => void;
  onSubmitAnswer?: (
    participantId: string,
    questionId: string,
    chosenAnswer: number,
    responseTimeSeconds: number
  ) => Promise<any>;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  room,
  participant,
  onFinishGame,
  onSubmitAnswer,
}) => {
  const engine = useGameEngine({
    initialQuestions: room.game.questions,
    settings: room.game.settings,
    roomId: room.roomCode,
    participantId: participant.id,
    onFinish: (finalScore, answers) => {
      onFinishGame(finalScore, answers);
    },
    onAnswerSubmit: async (answer) => {
      if (onSubmitAnswer) {
        try {
          await onSubmitAnswer(
            participant.id,
            answer.questionId,
            answer.chosenAnswer,
            answer.responseTime
          );
        } catch {
          // ignore
        }
      }
    },
  });

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    gameState,
    selectedOption,
    isCorrect,
    lastScoreBreakdown,
    score,
    streak,
    correctCount,
    remainingTime,
    totalTime,
    eliminatedOptions,
    usedLifelines,
    audiencePollData,
    selectAnswer,
    nextQuestion,
    applyBonus,
    useFiftyFifty,
    useSwapQuestion,
    useAudiencePoll,
  } = engine;

  if (!currentQuestion) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center text-slate-400">
        Đang tải câu hỏi...
      </div>
    );
  }

  const letters = ['A', 'B', 'C', 'D'];
  const isAnswered = gameState === 'ANSWERED' || gameState === 'NEXT_QUESTION';
  const isLastQuestion = currentIndex + 1 >= totalQuestions;

  // Swap question helper for Millionaire lifeline
  const handleSwapQuestion = () => {
    // Generate a bonus replacement question
    const replacement = {
      id: `swap-q-${Date.now()}`,
      question: `[Câu hỏi thay thế] Trong cấu trúc mạng Internet, mô hình OSI gồm bao nhiêu tầng chuẩn hóa?`,
      options: ['7 tầng', '4 tầng', '5 tầng', '3 tầng'],
      correctAnswer: 0,
      explanation: 'Mô hình OSI do tổ chức ISO ban hành chuẩn hóa thành 7 tầng kiến trúc mạng.',
      difficulty: 'Thông hiểu' as const,
      topic: 'Kiến trúc mạng OSI',
    };
    useSwapQuestion(replacement);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
      {/* 1. Score & Streak HUD */}
      <ScoreHud
        studentName={participant.studentName}
        className={participant.className}
        score={score}
        streak={streak}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        streakMessage={lastScoreBreakdown?.streakMessage}
      />

      {/* 2. Countdown Timer Bar */}
      <TimerBar
        remainingTime={remainingTime}
        totalTime={totalTime}
      />

      {/* 3. Specific Game Visual Banner (Racing, Wheel, Bomb, Puzzle, etc.) */}
      <GameVisualBanner
        gameType={room.game.gameType}
        currentQuestionIndex={currentIndex}
        totalQuestions={totalQuestions}
        streak={streak}
        score={score}
        playerName={participant.studentName}
        timeRemaining={remainingTime}
        maxTime={totalTime}
        isAnswered={isAnswered}
        isCorrect={isCorrect}
        currentQuestion={currentQuestion}
        selectedOption={selectedOption}
        correctCount={correctCount}
        usedLifelines={usedLifelines}
        audiencePollData={audiencePollData}
        onApplyBonus={applyBonus}
        onSelectOption={(idx) => selectAnswer(idx)}
        onUseFiftyFifty={useFiftyFifty}
        onUseSwapQuestion={handleSwapQuestion}
        onUseAudiencePoll={useAudiencePoll}
        onGuessSecret={(guessedRight) => {
          if (guessedRight) {
            applyBonus(300, 'Đoán đúng hình ảnh bí mật (+300đ)');
          }
        }}
      />

      {/* 4. Question Card (Metadata, text, code block, image) */}
      <div className="mb-4">
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
        />
      </div>

      {/* 5. 4 Interactive Options (A, B, C, D) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
        {currentQuestion.options.map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          const isRightOption = idx === currentQuestion.correctAnswer;
          const isEliminated = eliminatedOptions.includes(idx);

          return (
            <AnswerButton
              key={idx}
              letter={letters[idx]}
              text={optionText}
              index={idx}
              isAnswered={isAnswered}
              isSelected={isSelected}
              isCorrectOption={isRightOption}
              isEliminated={isEliminated}
              onClick={() => selectAnswer(idx)}
            />
          );
        })}
      </div>

      {/* 6. Answer Feedback Panel */}
      {isAnswered && (
        <AnswerFeedback
          isCorrect={isCorrect ?? false}
          scoreBreakdown={lastScoreBreakdown}
          question={currentQuestion}
          isLastQuestion={isLastQuestion}
          onNext={nextQuestion}
        />
      )}
    </div>
  );
};
