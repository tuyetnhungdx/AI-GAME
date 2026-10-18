import React, { useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Bot, 
  CheckCircle, 
  Clock, 
  Copy, 
  Database, 
  Flame, 
  Gamepad2, 
  GraduationCap, 
  Layers, 
  Plus, 
  Play, 
  School, 
  Settings, 
  Share2, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  Trophy, 
  Users 
} from 'lucide-react';
import { ClassGroup, Game, Question, Room, TeacherProfile } from '../../types';
import { sounds } from '../../utils/audio';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  games: Game[];
  classes: ClassGroup[];
  activeRoom: Room | null;
  onSelectGameToHost: (game: Game) => void;
  onNavigateToCreateAI: () => void;
  onViewResults: (room: Room) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  games,
  classes,
  activeRoom,
  onSelectGameToHost,
  onNavigateToCreateAI,
  onViewResults,
}) => {
  const [sidebarTab, setSidebarTab] = useState<string>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Homework assign modal state
  const [assigningGame, setAssigningGame] = useState<Game | null>(null);
  const [assignedClass, setAssignedClass] = useState<string>('12A1');
  const [assignedSuccess, setAssignedSuccess] = useState<boolean>(false);

  const totalStudents = classes.reduce((acc, c) => acc + c.studentCount, 0);
  const totalPlays = games.reduce((acc, g) => acc + (g.playCount || 0), 0);
  const avgOverallScore = Math.round(
    games.reduce((acc, g) => acc + (g.averageScore || 800), 0) / Math.max(1, games.length)
  );

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    sounds.playSpinClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmAssign = () => {
    setAssignedSuccess(true);
    sounds.playFanfare();
    setTimeout(() => {
      setAssignedSuccess(false);
      setAssigningGame(null);
    }, 1800);
  };

  const menuItems = [
    { id: 'overview', label: '1. Tổng quan', icon: BarChart3 },
    { id: 'ai-create', label: '2. Tạo trò chơi bằng AI', icon: Sparkles, badge: 'AI' },
    { id: 'manual-create', label: '3. Tạo trò chơi thủ công', icon: Plus },
    { id: 'games-library', label: '4. Kho trò chơi', icon: Layers },
    { id: 'question-bank', label: '5. Ngân hàng câu hỏi', icon: BookOpen },
    { id: 'classes', label: '6. Lớp học', icon: School },
    { id: 'students', label: '7. Học sinh', icon: Users },
    { id: 'rooms', label: '8. Phiên chơi & Phòng học', icon: Gamepad2 },
    { id: 'results', label: '9. Kết quả', icon: Trophy },
    { id: 'analytics', label: '10. Thống kê & Phân tích AI', icon: TrendingUp },
    { id: 'settings', label: '11. Cài đặt & Triển khai Vercel', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Teacher Top Info Card */}
      <div className="bg-[#0A1424] border border-cyan-500/30 rounded-3xl p-6 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">
            {teacher.avatar || '👩‍🏫'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {teacher.fullName}
              </h2>
              <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2.5 py-0.5 rounded-full font-semibold">
                Giáo viên Tin học THPT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {teacher.school} • Hệ thống Game Giáo dục tích hợp Trí tuệ Nhân tạo
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToCreateAI}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>TẠO TRÒ CHƠI BẰNG AI</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-1 bg-[#07111E] border border-slate-800 p-3 rounded-3xl shadow-lg h-fit">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-2">
            DANH MỤC QUẢN LÝ
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = sidebarTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'ai-create') {
                    onNavigateToCreateAI();
                  } else {
                    setSidebarTab(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* TAB 1: OVERVIEW */}
          {(sidebarTab === 'overview' || sidebarTab === 'analytics') && (
            <>
              {/* 5 Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-[#0A1424] border border-cyan-500/30 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-400">Tổng trò chơi</div>
                  <div className="text-2xl font-mono font-black text-white mt-1">
                    {games.length}
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                    <span>8 kiểu trò chơi</span>
                  </div>
                </div>

                <div className="bg-[#0A1424] border border-purple-500/30 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-400">Tổng học sinh</div>
                  <div className="text-2xl font-mono font-black text-purple-300 mt-1">
                    {totalStudents}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">4 lớp THPT</div>
                </div>

                <div className="bg-[#0A1424] border border-indigo-500/30 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-400">Lượt chơi</div>
                  <div className="text-2xl font-mono font-black text-indigo-300 mt-1">
                    {totalPlays}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">+142 tuần này</div>
                </div>

                <div className="bg-[#0A1424] border border-amber-500/30 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-400">Điểm trung bình</div>
                  <div className="text-2xl font-mono font-black text-amber-300 mt-1">
                    {avgOverallScore}
                  </div>
                  <div className="text-[10px] text-amber-400/80 mt-1">Học lực Khá Giỏi</div>
                </div>

                <div className="bg-[#0A1424] border border-emerald-500/30 rounded-2xl p-4 col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400">Tỷ lệ hoàn thành</div>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                    96.5%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Tương tác sôi nổi</div>
                </div>
              </div>

              {/* Active Room Callout if any */}
              {activeRoom && (
                <div className="bg-gradient-to-r from-cyan-950/60 via-indigo-950/60 to-purple-950/60 border border-cyan-500/50 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      PHÒNG ĐANG MỞ HOẠT ĐỘNG
                    </span>
                    <h3 className="text-base font-bold text-white">
                      Mã phòng: <span className="font-mono text-cyan-300 font-extrabold text-xl ml-1">{activeRoom.roomCode}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeRoom.game.title} ({activeRoom.participants.length} học sinh)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewResults(activeRoom)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition-all"
                    >
                      Xem kết quả & Thống kê AI
                    </button>
                    <button
                      onClick={() => onSelectGameToHost(activeRoom.game)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition-all"
                    >
                      Màn hình phòng chiếu
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Game Library Section */}
              <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-cyan-400" />
                      Kho trò chơi gần đây
                    </h3>
                    <p className="text-xs text-slate-400">
                      Chọn trò chơi để mở phòng học trực tiếp hoặc giao bài về nhà
                    </p>
                  </div>
                  <button
                    onClick={onNavigateToCreateAI}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tạo thêm</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {games.map((g) => (
                    <div
                      key={g.id}
                      className="bg-[#0A1424] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all shadow group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                            {g.subject} {g.grade}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {g.questions.length} câu • {g.playCount || 0} lượt
                          </span>
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {g.title}
                        </h4>

                        <div className="text-[11px] text-slate-400 mt-1">
                          Sách: {g.textbook} • Bài: {g.lesson}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                        <button
                          onClick={() => onSelectGameToHost(g)}
                          className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs border border-cyan-500/40 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-cyan-300" />
                          <span>CHƠI LỚP</span>
                        </button>

                        <button
                          onClick={() => setAssigningGame(g)}
                          className="py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-all"
                        >
                          GIAO BÀI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 4: KHO TRÒ CHƠI */}
          {sidebarTab === 'games-library' && (
            <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-lg text-white mb-2">KHO TRÒ CHƠI ĐÃ SOẠN ({games.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((g) => (
                  <div key={g.id} className="bg-[#0A1424] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">
                        {g.subject} {g.grade}
                      </span>
                      <h4 className="font-bold text-base text-white mt-2">{g.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{g.questions.length} câu trắc nghiệm • {g.settings.timePerQuestion}s/câu</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => onSelectGameToHost(g)}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                      >
                        MỞ PHÒNG CHƠI
                      </button>
                      <button
                        onClick={() => setAssigningGame(g)}
                        className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                      >
                        Giao bài
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NGÂN HÀNG CÂU HỎI */}
          {sidebarTab === 'question-bank' && (
            <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-lg text-white">NGÂN HÀNG CÂU HỎI TIN HỌC THPT</h3>
              <p className="text-xs text-slate-400">Tổng cộng {games.reduce((acc, g) => acc + g.questions.length, 0)} câu hỏi trắc nghiệm đã được kiểm định</p>
              <div className="space-y-3">
                {games[0]?.questions.map((q, i) => (
                  <div key={q.id || i} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
                      <span>Câu {i + 1} ({q.difficulty})</span>
                      <span className="text-slate-500">{q.topic}</span>
                    </div>
                    <p className="text-slate-200 font-medium">{q.question}</p>
                    {q.codeSnippet && <pre className="bg-black/50 p-2 rounded mt-2 text-[11px] font-mono text-emerald-300">{q.codeSnippet}</pre>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6 & 7: LỚP HỌC & HỌC SINH */}
          {(sidebarTab === 'classes' || sidebarTab === 'students') && (
            <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="font-bold text-lg text-white">DANH SÁCH LỚP HỌC & HỌC SINH PHỤ TRÁCH</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-[#0A1424] border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg text-white">Lớp {cls.name}</h4>
                      <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded">
                        {cls.studentCount} học sinh
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 mb-3">
                      <div>Năm học: {cls.schoolYear}</div>
                      <div>Trường: THPT Nguyễn Dục</div>
                    </div>
                    <div className="border-t border-slate-800 pt-3">
                      <div className="text-xs font-bold text-slate-300 mb-2">Học sinh tiêu biểu:</div>
                      <div className="space-y-1">
                        {cls.students.slice(0, 4).map((st) => (
                          <div key={st.id} className="flex justify-between text-[11px] text-slate-400">
                            <span>{st.fullName} ({st.studentCode})</span>
                            <span className="font-mono text-amber-400 font-bold">{st.avgScore} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8, 9, 10: PHIÊN CHƠI & KẾT QUẢ */}
          {(sidebarTab === 'rooms' || sidebarTab === 'results') && (
            <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="font-bold text-lg text-white">CÁC PHIÊN CHƠI GẦN ĐÂY</h3>
              {activeRoom ? (
                <div className="p-4 bg-slate-900/60 rounded-2xl border border-cyan-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono text-cyan-300 font-bold">MÃ: {activeRoom.roomCode}</span>
                    <h4 className="font-bold text-white text-sm">{activeRoom.game.title}</h4>
                    <p className="text-xs text-slate-400">{activeRoom.participants.length} học sinh tham gia</p>
                  </div>
                  <button
                    onClick={() => onViewResults(activeRoom)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl"
                  >
                    Xem chi tiết kết quả
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Chưa có phiên chơi trực tiếp nào đang mở.</p>
              )}
            </div>
          )}

          {/* TAB 11: CÀI ĐẶT & TRIỂN KHAI */}
          {sidebarTab === 'settings' && (
            <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-xs text-slate-300 leading-relaxed">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                HƯỚNG DẪN TRIỂN KHAI VERCEL & SUPABASE
              </h3>
              <p>
                Dự án đã được cấu hình sẵn sàng 100% để triển khai lên Vercel và Supabase theo đúng chuẩn full-stack:
              </p>
              <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px] text-cyan-300">
                <div>1. Database: File <strong className="text-amber-300">/supabase-schema.sql</strong> chứa 10 bảng đầy đủ.</div>
                <div>2. Biến môi trường: File <strong className="text-amber-300">/.env.example</strong> đã cấu hình sẵn các key.</div>
                <div>3. Backend: API <strong className="text-amber-300">/api/ai/generate-questions</strong> và <strong className="text-amber-300">/api/ai/analyze-results</strong> qua Express / Server Actions.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Homework Assign Modal */}
      {assigningGame && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1728] border-2 border-purple-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="font-bold text-lg text-white mb-1">GIAO BÀI TẬP VỀ NHÀ</h3>
            <p className="text-xs text-slate-400 mb-4">{assigningGame.title}</p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">CHỌN LỚP GIAO BÀI</label>
                <select
                  value={assignedClass}
                  onChange={(e) => setAssignedClass(e.target.value)}
                  className="w-full bg-[#060D17] border border-slate-700 text-white p-2.5 rounded-xl outline-none"
                >
                  <option value="12A1">Lớp 12A1 (38 học sinh)</option>
                  <option value="12A2">Lớp 12A2 (36 học sinh)</option>
                  <option value="11A1">Lớp 11A1 (40 học sinh)</option>
                  <option value="10A1">Lớp 10A1 (42 học sinh)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">HẠN NỘP BÀI</label>
                <input
                  type="date"
                  defaultValue="2026-10-25"
                  className="w-full bg-[#060D17] border border-slate-700 text-white p-2.5 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase mb-1">SỐ LẦN ĐƯỢC PHÉP CHƠI LẠI</label>
                <select className="w-full bg-[#060D17] border border-slate-700 text-white p-2.5 rounded-xl outline-none">
                  <option>Không giới hạn (Khuyến khích ôn tập)</option>
                  <option>1 lần duy nhất (Kiểm tra 15 phút)</option>
                  <option>Tối đa 3 lần</option>
                </select>
              </div>

              {assignedSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-center">
                  ✓ Đã giao bài tập thành công cho lớp {assignedClass}!
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningGame(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAssign}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold"
                >
                  Xác nhận giao bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
