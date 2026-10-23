import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  Copy, 
  Eye, 
  Gamepad2, 
  Play, 
  QrCode, 
  Share2, 
  Trophy, 
  UserCheck, 
  Users, 
  Wifi 
} from 'lucide-react';
import { Room } from '../../types';
import { sounds } from '../../utils/audio';

interface LiveRoomHostViewProps {
  room: Room;
  onStartGame: () => void;
  onJoinAsStudent: (roomCode: string) => void;
}

export const LiveRoomHostView: React.FC<LiveRoomHostViewProps> = ({
  room,
  onStartGame,
  onJoinAsStudent,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [connectedParticipants, setConnectedParticipants] = useState<any[]>(
  room.participants || []
);

useEffect(() => {
  const loadParticipants = async () => {
    try {
      const response = await fetch(
        `/api/rooms/${room.roomCode}/participants`
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.success) {
        setConnectedParticipants(data.participants || []);
      }
    } catch (error) {
      console.error('Lỗi tải học sinh trong phòng:', error);
    }
  };

  loadParticipants();

  const timer = setInterval(loadParticipants, 2000);

  return () => clearInterval(timer);
}, [room.roomCode]);

  const roomUrl = `${window.location.origin}?room=${room.roomCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    sounds.playSpinClick();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopiedLink(true);
    sounds.playSpinClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Projection Stage Header */}
      <div className="bg-[#071324] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden mb-8">
        {/* Ambient neon radial */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-3">
          <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>PHÒNG HỌC ĐANG MỞ (SẴN SÀNG CHIẾU MÀN HÌNH LỚP)</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-mono">
          HỌC SINH TRUY CẬP VÀ NHẬP MÃ:
        </p>

        {/* Big Room Code for Projector */}
        <div className="text-5xl sm:text-7xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-200 to-amber-300 my-4 tracking-widest select-all">
          {room.roomCode}
        </div>

        <h2 className="text-lg sm:text-2xl font-bold text-white mb-2">
          {room.game.title}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 font-medium mb-6">
          <span>Giáo viên: <strong className="text-cyan-300">Cô Trần Thị Tuyết Nhung</strong></span>
          <span>•</span>
          <span>Môn: <strong className="text-purple-300">{room.game.subject} {room.game.grade}</strong></span>
          <span>•</span>
          <span>Bộ câu hỏi: <strong className="text-amber-300">{room.game.questions.length} câu</strong></span>
        </div>

        {/* Action Buttons: Copy Code, Copy Link, QR */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95 shadow"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copiedCode ? 'ĐÃ SAO CHÉP MÃ' : 'SAO CHÉP MÃ'}</span>
          </button>

          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95 shadow"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-purple-400" />}
            <span>{copiedLink ? 'ĐÃ SAO CHÉP LINK' : 'SAO CHÉP LINK'}</span>
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95 shadow"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>XEM QR CODE</span>
          </button>

          <button
            onClick={() => onJoinAsStudent(room.roomCode)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-300 font-bold text-xs border border-purple-500/40 transition-all active:scale-95 shadow"
            title="Mở giao diện học sinh để tự trải nghiệm hoặc thử nghiệm"
          >
            <Eye className="w-4 h-4 text-purple-300" />
            <span>MỞ VAI TRÒ HỌC SINH</span>
          </button>
        </div>

        {/* Start Game Giant Button */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base sm:text-lg tracking-wider shadow-xl shadow-emerald-500/30 active:scale-95 transition-all inline-flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>BẮT ĐẦU TRÒ CHƠI NGAY</span>
          </button>
        </div>
      </div>

      {/* Lobby Participants Card */}
      <div className="bg-[#0A1424] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-white">
              Danh sách học sinh đã kết nối ({connectedParticipants.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Học sinh sẽ xuất hiện tức thì khi nhập mã phòng
          </span>
        </div>

       {connectedParticipants.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Chưa có học sinh nào vào phòng. Hãy chia sẻ mã <strong>{room.roomCode}</strong> lên máy chiếu!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
           {connectedParticipants.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{p.studentName}</div>
                    <div className="text-[10px] text-slate-400">{p.className}</div>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold font-mono">
                  Đã vào ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1728] border-2 border-cyan-500/50 rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <h3 className="font-bold text-lg text-white mb-1">QUÉT MÃ ĐỂ VÀO PHÒNG</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">MÃ PHÒNG: {room.roomCode}</p>

            {/* Generated SVG QR visual */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-4">
              <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" fill="#08111F" />
                <rect x="5" y="5" width="20" height="20" fill="#fff" />
                <rect x="10" y="10" width="10" height="10" fill="#08111F" />
                <rect x="70" y="0" width="30" height="30" fill="#08111F" />
                <rect x="75" y="5" width="20" height="20" fill="#fff" />
                <rect x="80" y="10" width="10" height="10" fill="#08111F" />
                <rect x="0" y="70" width="30" height="30" fill="#08111F" />
                <rect x="5" y="75" width="20" height="20" fill="#fff" />
                <rect x="10" y="80" width="10" height="10" fill="#08111F" />
                <rect x="35" y="10" width="10" height="15" fill="#08111F" />
                <rect x="50" y="5" width="15" height="10" fill="#08111F" />
                <rect x="40" y="35" width="20" height="20" fill="#08111F" />
                <rect x="70" y="40" width="10" height="25" fill="#08111F" />
                <rect x="45" y="70" width="20" height="10" fill="#08111F" />
                <rect x="75" y="75" width="15" height="15" fill="#08111F" />
              </svg>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Học sinh dùng camera điện thoại hoặc Zalo để quét và tự động điền mã phòng!
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
