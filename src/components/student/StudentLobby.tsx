import React, { useEffect } from 'react';
import { Bot, Gamepad2, Play, School, Sparkles, Users, Wifi } from 'lucide-react';
import { Participant, Room } from '../../types';
import { sounds } from '../../utils/audio';

interface StudentLobbyProps {
  room: Room;
  currentParticipant: Participant;
  onStartGame: () => void;
  isHost?: boolean;
}

export const StudentLobby: React.FC<StudentLobbyProps> = ({
  room,
  currentParticipant,
  onStartGame,
  isHost = false,
}) => {
  useEffect(() => {
    sounds.playSpinClick();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header Room Card */}
      <div className="bg-[#0A1424] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-2xl text-center relative overflow-hidden mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>PHÒNG CHỜ TRỰC TUYẾN</span>
        </div>

        <div className="text-xs text-slate-400 uppercase tracking-widest font-mono">MÃ PHÒNG CHƠI</div>
        <div className="text-4xl sm:text-5xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300 my-2 tracking-wider">
          {room.roomCode}
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white mt-3">
          {room.game.title}
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-2">
          <span>Môn: <strong className="text-cyan-300">{room.game.subject} {room.game.grade}</strong></span>
          <span>•</span>
          <span>Số câu: <strong className="text-purple-300">{room.game.questions.length} câu</strong></span>
          <span>•</span>
          <span>Thời gian: <strong className="text-amber-300">{room.game.settings.timePerQuestion}s/câu</strong></span>
        </div>

        {/* Start Game Action */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>{isHost ? 'BẮT ĐẦU TRÒ CHƠI' : 'SẴN SÀNG – BẮT ĐẦU NGAY!'}</span>
          </button>
        </div>
      </div>

      {/* Participants list */}
      <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-200">
              Học sinh đã tham gia ({room.participants.length})
            </h3>
          </div>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Trực tiếp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
          {room.participants.map((p, idx) => {
            const isMe = p.id === currentParticipant.id;
            return (
              <div
                key={p.id || idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isMe
                    ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{p.studentName}</span>
                      {isMe && (
                        <span className="text-[10px] bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded font-extrabold">
                          BẠN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">{p.className}</div>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-amber-400 font-semibold">
                  Sẵn sàng ✓
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
