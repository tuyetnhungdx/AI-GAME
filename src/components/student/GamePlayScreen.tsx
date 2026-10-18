import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, Flame, HelpCircle, Trophy, XCircle, Zap } from 'lucide-react';
import { Game, Participant, Question, Room } from '../../types';
import { sounds } from '../../utils/audio';
import { CodeBlock } from '../CodeBlock';
import { GameVisualBanner } from '../games/GameVisualBanner';

interface GamePlayScreenProps {
  room: Room;
  participant: Participant;
  onFinishGame: (finalScore: number, correctCount: number, wrongCount: number) => void;
  onSubmitAnswer: (
    participantId: string,
    questionId: string,
    chosenAnswer: number,
    responseTimeSeconds: number
  ) => Promise<{ isCorrect: boolean; correctAnswer: number; explanation: string; scoreAwarded: number }>;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  room,
  participant,
  onFinishGame,
  onSubmitAnswer,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string>('');
  const [correctAnswerIdx, setCorrectAnswerIdx] = useState<number>(0);
  const [lastScoreAwarded, setLastScoreAwarded] = useState<number>(0);

  // Stats local tracking
  const [score, setScore] = useState(participant.score || 0);
  const [streak, setStreak] = useState(participant.streak || 0);
  const [correctCount, setCorrectCount] = useState(participant.correctCount || 0);
  const [wrongCount, setWrongCount] = useState(participant.wrongCount || 0);

  // Timer
  const maxTime = room.game.settings.timePerQuestion || 20;
  const [timeLeft, setTimeLeft] = useState(maxTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentQ: Question = room.game.questions[currentIdx] || room.game.questions[0];

  // Start timer when question changes
  useEffect(() => {
    setTimeLeft(maxTime);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(null);
    startTimeRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx]);

  const handleTimeOut = async () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    sounds.playWrong();
    setStreak(0);
    setWrongCount((c) => c + 1);
    setCorrectAnswerIdx(currentQ.correctAnswer);
    setExplanation(currentQ.explanation || 'Hết thời gian trả lời.');
  };

  const handleOptionSelect = async (optIdx: number) => {
    if (isAnswered) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedOption(optIdx);

    const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await onSubmitAnswer(participant.id, currentQ.id, optIdx, elapsed);
      setIsCorrect(res.isCorrect);
      setCorrectAnswerIdx(res.correctAnswer);
      setExplanation(res.explanation);
      setLastScoreAwarded(res.scoreAwarded);

      if (res.isCorrect) {
        sounds.playCorrect();
        setScore((s) => s + res.scoreAwarded);
        setStreak((st) => st + 1);
        setCorrectCount((c) => c + 1);
      } else {
        sounds.playWrong();
        setStreak(0);
        setWrongCount((w) => w + 1);
      }
    } catch {
      // Local calculation fallback
      const right = optIdx === currentQ.correctAnswer;
      setIsCorrect(right);
      setCorrectAnswerIdx(currentQ.correctAnswer);
      setExplanation(currentQ.explanation);
      if (right) {
        sounds.playCorrect();
        const bonus = Math.round(Math.max(0, (maxTime - elapsed) / maxTime) * 100);
        const pts = 100 + bonus;
        setLastScoreAwarded(pts);
        setScore((s) => s + pts);
        setStreak((st) => st + 1);
        setCorrectCount((c) => c + 1);
      } else {
        sounds.playWrong();
        setStreak(0);
        setWrongCount((w) => w + 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < room.game.questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      sounds.playFanfare();
      onFinishGame(score, correctCount, wrongCount);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];
  const optionColors = [
    'hover:border-cyan-400 bg-cyan-950/20 text-cyan-200 border-cyan-500/30',
    'hover:border-purple-400 bg-purple-950/20 text-purple-200 border-purple-500/30',
    'hover:border-amber-400 bg-amber-950/20 text-amber-200 border-amber-500/30',
    'hover:border-emerald-400 bg-emerald-950/20 text-emerald-200 border-emerald-500/30',
  ];

  const timeRatio = (timeLeft / maxTime) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#0A1424] border border-cyan-500/30 rounded-2xl p-3 md:p-4 mb-4 shadow-lg">
        <div>
          <div className="text-[11px] text-slate-400">Thí sinh</div>
          <div className="text-sm md:text-base font-bold text-white flex items-center gap-1.5">
            <span>{participant.studentName}</span>
            <span className="text-xs text-cyan-400 font-mono">({participant.className})</span>
          </div>
        </div>

        {/* Question Counter */}
        <div className="text-center">
          <div className="text-[11px] text-slate-400">Câu hỏi</div>
          <div className="text-base md:text-lg font-mono font-extrabold text-cyan-300">
            {currentIdx + 1} <span className="text-xs text-slate-500">/ {room.game.questions.length}</span>
          </div>
        </div>

        {/* Streak HUD */}
        <div className="text-center hidden sm:block">
          <div className="text-[11px] text-slate-400">Chuỗi đúng</div>
          <div className="text-base font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-600'}`} />
            <span>{streak}</span>
          </div>
        </div>

        {/* Score HUD */}
        <div className="text-right">
          <div className="text-[11px] text-slate-400">Tổng điểm</div>
          <div className="text-base md:text-xl font-mono font-black text-amber-300 flex items-center gap-1 justify-end">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{score}</span>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="relative mb-5">
        <div className="flex justify-between items-center text-xs font-mono mb-1 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 5 ? 'text-rose-400 animate-spin' : 'text-cyan-400'}`} />
            <span>Thời gian còn lại:</span>
          </span>
          <span className={`font-bold ${timeLeft <= 5 ? 'text-rose-400 text-sm' : 'text-cyan-300'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft > 7
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                : 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse'
            }`}
            style={{ width: `${timeRatio}%` }}
          ></div>
        </div>
      </div>

      {/* Interactive Game Visual Banner (Racing, Wheel, Bomb, Puzzle, etc.) */}
      <GameVisualBanner
        gameType={room.game.gameType}
        currentQuestionIndex={currentIdx}
        totalQuestions={room.game.questions.length}
        streak={streak}
        score={score}
        playerName={participant.studentName}
        timeRemaining={timeLeft}
        maxTime={maxTime}
        isAnswered={isAnswered}
        isCorrect={isCorrect ?? undefined}
      />

      {/* Question Box */}
      <div className="bg-[#0B1728] border border-cyan-500/40 rounded-3xl p-5 md:p-7 mb-5 shadow-2xl relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50">
            {currentQ.difficulty}
          </span>
          {currentQ.topic && (
            <span className="text-xs text-slate-400 font-medium">
              Chủ đề: <strong className="text-slate-300">{currentQ.topic}</strong>
            </span>
          )}
        </div>

        {/* Big Question Text */}
        <h2 className="text-lg sm:text-2xl font-bold text-white leading-relaxed text-left">
          {currentQ.question}
        </h2>

        {/* Informatics Code Snippet if applicable */}
        {currentQ.codeSnippet && (
          <CodeBlock
            code={currentQ.codeSnippet}
            language={currentQ.codeLanguage || 'python'}
          />
        )}
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        {currentQ.options.map((optionText, idx) => {
          const isSelected = selectedOption === idx;
          const isTheCorrectOne = isAnswered && idx === correctAnswerIdx;
          const isWrongSelection = isAnswered && isSelected && !isCorrect;

          let buttonStyle = optionColors[idx % optionColors.length];

          if (isAnswered) {
            if (isTheCorrectOne) {
              buttonStyle = 'bg-emerald-900/60 border-2 border-emerald-400 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-[1.02]';
            } else if (isWrongSelection) {
              buttonStyle = 'bg-rose-950/60 border-2 border-rose-500 text-rose-200 opacity-80';
            } else {
              buttonStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswered}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition-all flex items-start gap-3.5 select-none active:scale-[0.98] disabled:cursor-default ${buttonStyle}`}
            >
              <div
                className={`w-8 h-8 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 ${
                  isTheCorrectOne
                    ? 'bg-emerald-400 text-slate-950'
                    : isWrongSelection
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-200'
                }`}
              >
                {optionLetters[idx]}
              </div>
              <div className="flex-1 text-sm sm:text-base font-medium leading-snug pt-0.5">
                {optionText}
              </div>
              {isTheCorrectOne && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              {isWrongSelection && (
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback Banner */}
      {isAnswered && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border mb-5 transition-all animate-fadeIn ${
            isCorrect
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span>🎉 CHÍNH XÁC!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-rose-400" />
                  <span>CHƯA CHÍNH XÁC</span>
                </>
              )}
            </div>
            {isCorrect && (
              <span className="text-xs sm:text-sm font-mono font-extrabold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                +{lastScoreAwarded} điểm
              </span>
            )}
          </div>

          {!isCorrect && (
            <p className="text-xs sm:text-sm font-semibold text-rose-300 mb-1">
              Đáp án đúng: <strong className="text-white underline">{optionLetters[correctAnswerIdx]}. {currentQ.options[correctAnswerIdx]}</strong>
            </p>
          )}

          {explanation && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5 mt-2">
              💡 <strong>Giải thích:</strong> {explanation}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>{currentIdx + 1 < room.game.questions.length ? 'CÂU TIẾP THEO' : 'XEM KẾT QUẢ CUỐI CÙNG'}</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
