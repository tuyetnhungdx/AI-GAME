import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngineState, GameSettings, ParticipantAnswer, Question } from '../types';
import { calculateScore, ScoreBreakdown } from '../lib/game/scoring';
import { prepareGameQuestions } from '../lib/game/shuffle';
import { sounds } from '../utils/audio';

export interface UseGameEngineProps {
  initialQuestions: Question[];
  settings: GameSettings;
  roomId?: string;
  participantId?: string;
  onFinish?: (finalScore: number, answers: ParticipantAnswer[]) => void;
  onAnswerSubmit?: (answer: ParticipantAnswer) => void;
}

export function useGameEngine({
  initialQuestions,
  settings,
  roomId = 'demo',
  participantId = 'guest',
  onFinish,
  onAnswerSubmit,
}: UseGameEngineProps) {
  const storageKey = `ai_game_session_${roomId}_${participantId}`;

  // Processed questions (shuffled once if configured)
  const [questions, setQuestions] = useState<Question[]>(() => {
    return prepareGameQuestions(
      initialQuestions,
      settings.randomizeQuestions ?? false,
      settings.randomizeAnswers ?? false
    );
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<GameEngineState>('WAITING');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [lastScoreBreakdown, setLastScoreBreakdown] = useState<ScoreBreakdown | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [answers, setAnswers] = useState<ParticipantAnswer[]>([]);
  
  // Multipliers & Lifelines
  const [scoreMultiplier, setScoreMultiplier] = useState<number>(1);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]); // for 50:50
  const [usedLifelines, setUsedLifelines] = useState<{ fiftyFifty: boolean; swapQuestion: boolean; audiencePoll: boolean }>({
    fiftyFifty: false,
    swapQuestion: false,
    audiencePoll: false,
  });
  const [audiencePollData, setAudiencePollData] = useState<number[] | null>(null);

  // Timer
  const timePerQuestion = settings.timePerQuestion || 20;
  const [remainingTime, setRemainingTime] = useState<number>(timePerQuestion);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const isLockedRef = useRef<boolean>(false);

  const currentQuestion: Question | undefined = questions[currentIndex];
  const totalQuestions = questions.length;

  // Restore session from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.currentIndex < questions.length && data.gameState !== 'FINISHED') {
          setCurrentIndex(data.currentIndex);
          setScore(data.score || 0);
          setStreak(data.streak || 0);
          setMaxStreak(data.maxStreak || 0);
          setCorrectCount(data.correctCount || 0);
          setWrongCount(data.wrongCount || 0);
          setAnswers(data.answers || []);
          setGameState('PLAYING');
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey, questions.length]);

  // Persist current session progress
  const saveSession = useCallback(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          currentIndex,
          score,
          streak,
          maxStreak,
          correctCount,
          wrongCount,
          answers,
          gameState,
        })
      );
    } catch {
      // ignore
    }
  }, [storageKey, currentIndex, score, streak, maxStreak, correctCount, wrongCount, answers, gameState]);

  useEffect(() => {
    saveSession();
  }, [saveSession]);

  // Clean timer helper
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start question countdown
  const startQuestion = useCallback(() => {
    clearTimer();
    setSelectedOption(null);
    setIsCorrect(null);
    setLastScoreBreakdown(null);
    setEliminatedOptions([]);
    setAudiencePollData(null);
    isLockedRef.current = false;

    setRemainingTime(timePerQuestion);
    questionStartTimeRef.current = Date.now();
    setGameState('PLAYING');

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearTimer();
          handleTimeout();
          return 0;
        }
        if (prev <= 5 && prev > 1) {
          sounds.playTick();
        }
        return prev - 1;
      });
    }, 1000);
  }, [timePerQuestion]);

  // Timeout handler
  const handleTimeout = () => {
    if (isLockedRef.current || gameState !== 'PLAYING') return;
    isLockedRef.current = true;
    clearTimer();

    sounds.playWrong();
    setIsCorrect(false);
    setSelectedOption(-1); // -1 indicates timeout

    const breakdown = calculateScore({
      isCorrect: false,
      remainingTime: 0,
      totalTime: timePerQuestion,
      currentStreak: streak,
    });
    setLastScoreBreakdown(breakdown);
    setStreak(0);
    setWrongCount((c) => c + 1);

    const answerRecord: ParticipantAnswer = {
      participantId,
      questionId: currentQuestion?.id || `q-${currentIndex}`,
      chosenAnswer: -1,
      isCorrect: false,
      responseTime: timePerQuestion,
      baseScore: 0,
      speedBonus: 0,
      streakBonus: 0,
      scoreAwarded: 0,
      totalScore: score,
      createdAt: new Date().toISOString(),
    };

    setAnswers((prev) => [...prev, answerRecord]);
    if (onAnswerSubmit) onAnswerSubmit(answerRecord);

    setGameState('ANSWERED');

    if (settings.autoNextQuestion) {
      setTimeout(() => {
        nextQuestion();
      }, 2500);
    }
  };

  // Student selects an answer option
  const selectAnswer = (optionIndex: number) => {
    if (isLockedRef.current || gameState !== 'PLAYING' || !currentQuestion) return;
    isLockedRef.current = true;
    clearTimer();

    setSelectedOption(optionIndex);
    const right = optionIndex === currentQuestion.correctAnswer;
    setIsCorrect(right);

    const elapsedSeconds = Math.max(0.5, Math.min(timePerQuestion, (Date.now() - questionStartTimeRef.current) / 1000));
    const timeRemainingSec = Math.max(0, timePerQuestion - elapsedSeconds);

    const breakdown = calculateScore({
      isCorrect: right,
      remainingTime: timeRemainingSec,
      totalTime: timePerQuestion,
      currentStreak: streak,
      speedBonusEnabled: settings.speedBonus !== false,
      streakBonusEnabled: settings.streakBonus !== false,
      multiplier: scoreMultiplier,
    });

    setLastScoreBreakdown(breakdown);

    if (right) {
      sounds.playCorrect();
      setScore((s) => s + breakdown.totalAwarded);
      setStreak(breakdown.newStreak);
      if (breakdown.newStreak > maxStreak) {
        setMaxStreak(breakdown.newStreak);
      }
      setCorrectCount((c) => c + 1);
    } else {
      sounds.playWrong();
      setStreak(0);
      setWrongCount((w) => w + 1);
    }

    // Reset one-time multiplier
    if (scoreMultiplier !== 1) {
      setScoreMultiplier(1);
    }

    const answerRecord: ParticipantAnswer = {
      participantId,
      questionId: currentQuestion.id,
      chosenAnswer: optionIndex,
      isCorrect: right,
      responseTime: Math.round(elapsedSeconds * 10) / 10,
      baseScore: breakdown.baseScore,
      speedBonus: breakdown.speedBonus,
      streakBonus: breakdown.streakBonus,
      scoreAwarded: breakdown.totalAwarded,
      totalScore: score + breakdown.totalAwarded,
      createdAt: new Date().toISOString(),
    };

    setAnswers((prev) => [...prev, answerRecord]);
    if (onAnswerSubmit) onAnswerSubmit(answerRecord);

    setGameState('ANSWERED');

    if (settings.autoNextQuestion) {
      setTimeout(() => {
        nextQuestion();
      }, 2200);
    }
  };

  // Advance to next question or finish game
  const nextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setGameState('NEXT_QUESTION');
      startQuestion();
    } else {
      finishGame();
    }
  };

  // Finish game
  const finishGame = () => {
    clearTimer();
    setGameState('FINISHED');
    sounds.playFanfare();
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
    if (onFinish) {
      onFinish(score, answers);
    }
  };

  // Start game from WAITING state
  const startGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setAnswers([]);
    startQuestion();
  };

  // Apply extra bonus points (e.g. from Wheel of Fortune or Guess Puzzle +300 pts)
  const applyBonus = (points: number, label: string, multiplier: number = 1) => {
    if (points > 0) {
      setScore((s) => s + points);
      sounds.playFanfare();
    }
    if (multiplier > 1) {
      setScoreMultiplier(multiplier);
    }
  };

  // Lifeline: 50:50 for Millionaire
  const useFiftyFifty = () => {
    if (usedLifelines.fiftyFifty || !currentQuestion || gameState !== 'PLAYING') return;
    const correct = currentQuestion.correctAnswer;
    const wrongs = [0, 1, 2, 3].filter((i) => i !== correct);
    const toEliminate = wrongs.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(toEliminate);
    setUsedLifelines((prev) => ({ ...prev, fiftyFifty: true }));
    sounds.playSpinClick();
  };

  // Lifeline: Swap Question
  const useSwapQuestion = (replacementQuestion: Question) => {
    if (usedLifelines.swapQuestion || gameState !== 'PLAYING') return;
    const newQuestions = [...questions];
    newQuestions[currentIndex] = replacementQuestion;
    setQuestions(newQuestions);
    setUsedLifelines((prev) => ({ ...prev, swapQuestion: true }));
    startQuestion();
  };

  // Lifeline: Audience Poll
  const useAudiencePoll = () => {
    if (usedLifelines.audiencePoll || !currentQuestion || gameState !== 'PLAYING') return;
    const correct = currentQuestion.correctAnswer;
    const poll = [10, 10, 10, 10];
    poll[correct] += 50;
    const rem = 20;
    poll[(correct + 1) % 4] += Math.floor(rem * 0.5);
    poll[(correct + 2) % 4] += Math.floor(rem * 0.3);
    poll[(correct + 3) % 4] += Math.floor(rem * 0.2);
    setAudiencePollData(poll);
    setUsedLifelines((prev) => ({ ...prev, audiencePoll: true }));
    sounds.playSpinClick();
  };

  // Auto-start if state is not finished and not started
  useEffect(() => {
    if (gameState === 'WAITING' && questions.length > 0) {
      startGame();
    }
    return () => clearTimer();
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    gameState,
    selectedOption,
    isCorrect,
    lastScoreBreakdown,
    score,
    streak,
    maxStreak,
    correctCount,
    wrongCount,
    answers,
    remainingTime,
    totalTime: timePerQuestion,
    scoreMultiplier,
    eliminatedOptions,
    usedLifelines,
    audiencePollData,
    selectAnswer,
    nextQuestion,
    startGame,
    finishGame,
    applyBonus,
    useFiftyFifty,
    useSwapQuestion,
    useAudiencePoll,
  };
}
