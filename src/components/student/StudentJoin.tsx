import React, { useState } from 'react';
import { ArrowRight, Bot, Gamepad2, School, Sparkles, User, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface StudentJoinProps {
  onJoinRoom: (roomCode: string, studentName: string, className: string) => Promise<boolean>;
  initialRoomCode?: string;
}

export const StudentJoin: React.FC<StudentJoinProps> = ({ onJoinRoom, initialRoomCode = '' }) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('12A1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!roomCode.trim()) {
      setErrorMessage('Vui lòng nhập mã phòng chơi (ví dụ: TIN012)');
      return;
    }
    if (!studentName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của em');
      return;
    }

    setIsLoading(true);
    sounds.playSpinClick();

    try {
      const ok = await onJoinRoom(roomCode.trim().toUpperCase(), studentName.trim(), className);
      if (!ok) {
        setErrorMessage('Không tìm thấy phòng chơi với mã này hoặc phòng đã kết thúc.');
      }
    } catch {
      setErrorMessage('Lỗi kết nối tới máy chủ, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoStudent = (name: string, code: string, cls: string) => {
    setStudentName(name);
    setRoomCode(code);
    setClassName(cls);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-[0_0_25px_rgba(6,182,212,0.4)] mb-4">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          THAM GIA PHÒNG CHƠI
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Nhập mã phòng từ giáo viên để tranh tài kiến thức cùng cả lớp
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-[#0A1424] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Big Room Code Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                MÃ PHÒNG TRÒ CHƠI
              </label>
              <button
                type="button"
                onClick={() => setRoomCode('TIN012')}
                className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 font-semibold"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                Điền nhanh mã demo: <strong>TIN012</strong>
              </button>
            </div>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="VD: TIN012 HOẶC 825314"
              maxLength={10}
              className="w-full text-center text-2xl sm:text-3xl font-mono font-black tracking-widest uppercase bg-[#060D17] border-2 border-cyan-500/50 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 text-cyan-300 py-3.5 rounded-2xl outline-none placeholder:text-slate-600 transition-all shadow-inner"
              required
            />
          </div>

          {/* Student Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <span>HỌ VÀ TÊN HỌC SINH</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full bg-[#060D17] border border-slate-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 text-white px-4 py-3 rounded-xl outline-none text-sm placeholder:text-slate-500 transition-all"
              required
            />
          </div>

          {/* Class selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-cyan-400" />
              <span>LỚP HỌC</span>
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-4 py-3 rounded-xl outline-none text-sm cursor-pointer"
            >
              <option value="12A1">12A1 (THPT Nguyễn Dục)</option>
              <option value="12A2">12A2 (THPT Nguyễn Dục)</option>
              <option value="11A1">11A1 (THPT Nguyễn Dục)</option>
              <option value="10A1">10A1 (THPT Nguyễn Dục)</option>
              <option value="Tự do">Học sinh Tự do / Khác</option>
            </select>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-base tracking-wide shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'ĐANG KẾT NỐI PHÒNG...' : 'VÀO PHÒNG CHƠI'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Quick test presets */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 mb-2.5">
            💡 Nhấp để điền nhanh học sinh thử nghiệm:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemoStudent('Nguyễn Văn An', 'TIN012', '12A1')}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              👤 Nguyễn Văn An (12A1)
            </button>
            <button
              type="button"
              onClick={() => fillDemoStudent('Trần Thu Hà', 'TIN012', '12A1')}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              👤 Trần Thu Hà (12A1)
            </button>
            <button
              type="button"
              onClick={() => fillDemoStudent('Lê Hoàng Nam', 'TIN012', '12A1')}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              👤 Lê Hoàng Nam (12A1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
