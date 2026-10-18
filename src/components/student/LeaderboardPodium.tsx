import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle, Clock, Home, RotateCcw, Sparkles, Trophy, Users, XCircle } from 'lucide-react';
import { Participant, Room } from '../../types';
import { sounds } from '../../utils/audio';

interface LeaderboardPodiumProps {
  room: Room;
  currentParticipant: Participant;
  finalScore: number;
  correctCount: number;
  wrongCount: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onViewTeacherDashboard: () => void;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  room,
  currentParticipant,
  finalScore,
  correctCount,
  wrongCount,
  onPlayAgain,
  onGoHome,
  onViewTeacherDashboard,
}) => {
  // Fire celebratory confetti!
  useEffect(() => {
    sounds.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const timeout = setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 600);

    return () => clearTimeout(timeout);
  }, []);

  // Sort participants by score descending
  const sortedParticipants = [...room.participants].map(p => {
    if (p.id === currentParticipant.id) {
      return { ...p, score: finalScore, correctCount, wrongCount };
    }
    return p;
  }).sort((a, b) => b.score - a.score);

  const myRank = sortedParticipants.findIndex(p => p.id === currentParticipant.id) + 1;
  const top1 = sortedParticipants[0];
  const top2 = sortedParticipants[1];
  const top3 = sortedParticipants[2];

  const totalQuestions = room.game.questions.length;
  const accuracyPercent = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Celebration Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>HOÀN THÀNH PHIÊN CHƠI XUẤT SẮC!</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          BẢNG XẾP HẠNG CHUNG CUỘC
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {room.game.title}
        </p>
      </div>

      {/* Podium Top 3 */}
      <div className="flex justify-center items-end gap-3 sm:gap-6 my-8 max-w-lg mx-auto">
        {/* Top 2: Silver */}
        {top2 && (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-2xl sm:text-3xl mb-1">🥈</div>
            <div className="text-xs font-bold text-slate-300 truncate max-w-[90px] sm:max-w-[120px]">
              {top2.studentName}
            </div>
            <div className="text-[11px] font-mono text-cyan-300">{top2.score} pts</div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-800 to-slate-700/80 rounded-t-2xl border-t-2 border-slate-400 flex items-center justify-center font-black text-slate-400 text-xl shadow-lg mt-2">
              #2
            </div>
          </div>
        )}

        {/* Top 1: Gold */}
        {top1 && (
          <div className="flex-1 flex flex-col items-center -mt-6">
            <div className="text-4xl sm:text-5xl mb-1 animate-pulse">👑</div>
            <div className="text-xs sm:text-sm font-black text-amber-300 truncate max-w-[100px] sm:max-w-[140px]">
              {top1.studentName}
            </div>
            <div className="text-xs font-mono font-bold text-amber-400">{top1.score} pts</div>
            <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-950 via-amber-800/80 to-amber-600/90 rounded-t-2xl border-t-4 border-amber-300 flex items-center justify-center font-black text-amber-200 text-3xl shadow-[0_0_25px_rgba(251,191,36,0.4)] mt-2">
              #1
            </div>
          </div>
        )}

        {/* Top 3: Bronze */}
        {top3 && (
          <div className="flex-1 flex flex-col items-center">
            <div className="text-2xl sm:text-3xl mb-1">🥉</div>
            <div className="text-xs font-bold text-amber-600 truncate max-w-[90px] sm:max-w-[120px]">
              {top3.studentName}
            </div>
            <div className="text-[11px] font-mono text-amber-500">{top3.score} pts</div>
            <div className="w-full h-18 sm:h-20 bg-gradient-to-t from-amber-950/60 to-amber-900/40 rounded-t-2xl border-t-2 border-amber-700 flex items-center justify-center font-black text-amber-700 text-lg shadow-lg mt-2">
              #3
            </div>
          </div>
        )}
      </div>

      {/* Your Personal Result Card */}
      <div className="bg-[#0A1628] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-6 mb-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
          <div>
            <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              KẾT QUẢ CÁ NHÂN
            </div>
            <div className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>{currentParticipant.studentName}</span>
              <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/50">
                {currentParticipant.className}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700">
              <div className="text-[10px] text-slate-400">Thứ hạng</div>
              <div className="text-base sm:text-lg font-mono font-black text-amber-400">
                #{myRank > 0 ? myRank : 1} / {sortedParticipants.length}
              </div>
            </div>
            <div className="text-center px-4 py-1.5 bg-cyan-950 rounded-xl border border-cyan-500/40">
              <div className="text-[10px] text-cyan-300">Tổng điểm</div>
              <div className="text-base sm:text-lg font-mono font-black text-white">
                {finalScore} pts
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-center">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Đúng</span>
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-white">
              {correctCount} / {totalQuestions}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold mb-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Sai</span>
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-white">
              {wrongCount}
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Độ chính xác</span>
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-cyan-300">
              {accuracyPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-5 mb-8 shadow-xl">
        <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          Bảng điểm chi tiết toàn phòng
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-2.5 px-3">Hạng</th>
                <th className="py-2.5 px-3">Học sinh</th>
                <th className="py-2.5 px-3">Lớp</th>
                <th className="py-2.5 px-3 text-right">Điểm</th>
                <th className="py-2.5 px-3 text-center">Đúng / Sai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedParticipants.map((p, idx) => {
                const isMe = p.id === currentParticipant.id;
                return (
                  <tr
                    key={p.id || idx}
                    className={`transition-colors ${
                      isMe ? 'bg-cyan-950/40 text-cyan-200 font-bold' : 'hover:bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold">
                      {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span>{p.studentName}</span>
                        {isMe && (
                          <span className="text-[9px] bg-cyan-500 text-slate-950 px-1 py-0.2 rounded font-extrabold">
                            BẠN
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{p.className}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">
                      {p.score}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="text-emerald-400 font-semibold">{p.correctCount}</span>
                      <span className="text-slate-600"> / </span>
                      <span className="text-rose-400">{p.wrongCount}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onPlayAgain}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Chơi lại vòng mới</span>
        </button>

        <button
          onClick={onViewTeacherDashboard}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Xem phân tích giáo viên</span>
        </button>

        <button
          onClick={onGoHome}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-800 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Trang chủ</span>
        </button>
      </div>
    </div>
  );
};
