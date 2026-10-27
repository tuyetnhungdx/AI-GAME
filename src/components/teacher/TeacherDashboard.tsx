import { ClassManager } from './ClassManager';
import React, { useState } from 'react';
import { 
  BarChart3, 
  BookOpen, 
  Bot, 
  CheckCircle, 
  Clock, 
  Copy, 
  Database, 
  Download, 
  FileSpreadsheet, 
  Flame, 
  Gamepad2, 
  GraduationCap, 
  Layers, 
  Loader2, 
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
import { demoRoomTIN012 } from '../../data/initialData';
import { sounds } from '../../utils/audio';
import { 
  buildClassExportSummary, 
  downloadWorkbook, 
  generateExportFilename, 
  generateFullClassExcel 
} from '../../utils/excelExport';
import { ClassExcelExportPanel } from './ClassExcelExportPanel';
import { SupabaseSetupModal } from './SupabaseSetupModal';

interface TeacherDashboardProps {
  onClassesChange: (classes: ClassGroup[]) => boolean;
  teacher: TeacherProfile;
  games: Game[];
  onUpdateGame: (game: Game) => void;
  classes: ClassGroup[];
  activeRoom: Room | null;
  onSelectGameToHost: (game: Game) => void;
  onNavigateToCreateAI: () => void;
  onNavigateToCreate?: (mode: 'ai' | 'import') => void;
  onViewResults: (room: Room) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onClassesChange,
  teacher,
  games,
  onUpdateGame,
  classes,
  activeRoom,
  onSelectGameToHost,
  onNavigateToCreateAI,
  onNavigateToCreate,
  onViewResults,
}) => {
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<string>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const updateEditingQuestion = (
  qIndex: number,
  updater: (question: any) => any
) => {
  setEditingGame(prev => {
    if (!prev) return prev;

    return {
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === qIndex ? updater(q) : q
      ),
    };
  });
};

const handleSaveEditedGame = async () => {
  if (!editingGame) return;

  await onUpdateGame(editingGame);
  setEditingGame(null);

  window.alert('Đã lưu thay đổi trò chơi!');
};

  // Homework assign modal state
  const [assigningGame, setAssigningGame] = useState<Game | null>(null);
  const [assignedClass, setAssignedClass] = useState<string>('12A1');
  const [assignedSuccess, setAssignedSuccess] = useState<boolean>(false);

  // Quick export state
  const [isQuickExporting, setIsQuickExporting] = useState<boolean>(false);
  const [quickClassModal, setQuickClassModal] = useState<ClassGroup | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  const handleQuickExportRecent = async () => {
    setIsQuickExporting(true);
    sounds.playSpinClick();
    try {
      const targetClass = classes.find((c) => c.name === '12A1') || classes[0];
      const targetGame = games[0];
      const targetRoom = activeRoom || demoRoomTIN012;
      const summary = buildClassExportSummary(
        targetClass,
        targetGame,
        targetRoom.roomCode,
        targetRoom.participants
      );
      const workbook = await generateFullClassExcel(summary, targetGame.questions);
      const filename = generateExportFilename(targetClass.name, targetGame.title);
      await downloadWorkbook(workbook, filename);
      sounds.playFanfare();
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuickExporting(false);
    }
  };

  const handleExportClassDirect = async (cls: ClassGroup, specificGame?: Game) => {
    sounds.playSpinClick();
    try {
      const targetGame = specificGame || games[0];
      const targetRoom = activeRoom || demoRoomTIN012;
      const summary = buildClassExportSummary(
        cls,
        targetGame,
        targetRoom.roomCode,
        targetRoom.participants
      );
      const workbook = await generateFullClassExcel(summary, targetGame.questions);
      const filename = generateExportFilename(cls.name, targetGame.title);
      await downloadWorkbook(workbook, filename);
      sounds.playFanfare();
      setQuickClassModal(null);
    } catch (e) {
      console.error(e);
    }
  };

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
            onClick={() => {
              sounds.playSpinClick();
              setShowSupabaseModal(true);
            }}
            className="px-4 py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            title="Quản lý kết nối và sao chép mã SQL Supabase"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>KẾT NỐI SUPABASE</span>
          </button>

          <button
            onClick={onNavigateToCreateAI}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
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

              {/* FEATURE 21: TÍNH NĂNG "XUẤT LỚP GẦN NHẤT" TRÊN DASHBOARD */}
              <div className="bg-gradient-to-r from-emerald-950/70 via-teal-950/70 to-cyan-950/70 border border-emerald-500/40 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-lg shadow-emerald-950/50">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      LỚP VỪA CHƠI GẦN NHẤT • XUẤT 1-CHẠM
                    </span>
                    <h3 className="text-base font-extrabold text-white">
                      Lớp vừa chơi: <span className="text-emerald-300 font-mono">12A1</span> • Game: <span className="text-cyan-300">Tin học 12 – Bài 4</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      <strong className="text-emerald-400 font-semibold">39/42</strong> học sinh hoàn thành • Điểm trung bình: <strong className="text-amber-300 font-mono">8.2/10</strong> (82% đúng)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarTab('results')}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                  >
                    Tùy chọn lọc
                  </button>
                  <button
                    onClick={handleQuickExportRecent}
                    disabled={isQuickExporting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isQuickExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4 text-slate-950" />}
                    <span>📥 XUẤT EXCEL NGAY</span>
                  </button>
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
          {sidebarTab === 'classes' && (
  <ClassManager
    classes={classes}
    onChange={onClassesChange}
  />
)}
          {(sidebarTab === 'classes' || sidebarTab === 'students') && (
            <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-white">DANH SÁCH LỚP HỌC PHỤ TRÁCH ({classes.length} LỚP)</h3>
                  <p className="text-xs text-slate-400">Xem kết quả chi tiết hoặc xuất nhanh file Excel bảng điểm từng lớp</p>
                </div>
                <button
                  onClick={() => setSidebarTab('results')}
                  className="px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Trung tâm Xuất Excel</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <div key={cls.id} className="bg-[#0A1424] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors">
                          Lớp {cls.name}
                        </h4>
                        <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                         {cls.students?.length ?? cls.studentCount ?? 0} học sinh
                          <button
  type="button"
  onClick={() =>
    setExpandedClassId(
      expandedClassId === cls.id ? null : cls.id
    )
  }
  className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300"
>
  {expandedClassId === cls.id ? 'ẨN HỌC SINH' : 'XEM HỌC SINH'}
</button>
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 space-y-1 mb-3">
                        <div>Niên khóa: <span className="text-slate-300">{cls.schoolYear}</span></div>
                        <div>Môn: <span className="text-cyan-400 font-semibold">Tin học THPT</span></div>
                      </div>
                      <div className="border-t border-slate-800/80 pt-2.5 mb-4">
                        <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                          <span>Học sinh tiêu biểu:</span>
                          <span className="text-emerald-400 font-normal">Học lực tốt</span>
                        </div>
                        <div className="space-y-1">
                          {cls.students.slice(0, 3).map((st) => (
                            <div key={st.id} className="flex justify-between text-[11px] text-slate-400">
                              <span className="truncate">{st.fullName}</span>
                              <span className="font-mono text-amber-400 font-bold flex-shrink-0">{st.avgScore} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* FEATURE 13: NÚT XUẤT NHANH TẠI MỖI CARD LỚP */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setSidebarTab('results');
                          sounds.playSpinClick();
                        }}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                        <span>📊 KẾT QUẢ</span>
                      </button>

                      <button
                        onClick={() => {
                          setQuickClassModal(cls);
                          sounds.playSpinClick();
                        }}
                        className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>📥 XUẤT EXCEL</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8, 9, 10: PHIÊN CHƠI & KẾT QUẢ & XUẤT EXCEL */}
          {(sidebarTab === 'rooms' || sidebarTab === 'results') && (
            <div className="space-y-6">
              {/* Active Room if any */}
              {activeRoom && (
                <div className="p-4 bg-slate-900/80 rounded-2xl border border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                      MÃ PHÒNG: {activeRoom.roomCode}
                    </span>
                    <h4 className="font-bold text-white text-base mt-1">{activeRoom.game.title}</h4>
                    <p className="text-xs text-slate-400">{activeRoom.participants.length} học sinh tham gia</p>
                  </div>
                  <button
                    onClick={() => onViewResults(activeRoom)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Mở Báo cáo & Phân tích Sư phạm AI
                  </button>
                </div>
              )}

              {/* INTEGRATED FULL EXCEL EXPORT PANEL */}
              <ClassExcelExportPanel
                classes={classes}
                games={games}
                activeRoom={activeRoom}
                defaultClassId="12A1"
              />
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
{/* Edit Game Modal */}
{editingGame && (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-[#0B1728] border-2 border-amber-500/50 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-white">
            ✏️ SỬA TRÒ CHƠI
          </h3>
          <p className="text-xs text-slate-400">
            Chỉnh sửa nội dung rồi bấm LƯU THAY ĐỔI
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingGame(null)}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          Đóng
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs text-slate-300 font-bold mb-1">
            TÊN TRÒ CHƠI
          </label>

          <input
            value={editingGame.title || ''}
            onChange={(e) =>
              setEditingGame({
                ...editingGame,
                title: e.target.value,
              })
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-300 font-bold mb-1">
            MÔ TẢ
          </label>

          <textarea
            value={editingGame.description || ''}
            onChange={(e) =>
              setEditingGame({
                ...editingGame,
                description: e.target.value,
              })
            }
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
        </div>
      </div>

      <div className="space-y-5">
        {editingGame.questions.map((q, qIdx) => (
          <div
            key={q.id || qIdx}
            className="border border-slate-700 rounded-2xl p-4 bg-slate-900/60"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-cyan-300">
                Câu {qIdx + 1}
              </span>

              <button
                type="button"
                onClick={() =>
                  setEditingGame(prev =>
                    prev
                      ? {
                          ...prev,
                          questions: prev.questions.filter(
                            (_, index) => index !== qIdx
                          ),
                        }
                      : prev
                  )
                }
                className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs"
              >
                Xóa câu
              </button>
            </div>

            <textarea
              value={q.question || ''}
              onChange={(e) =>
                updateEditingQuestion(qIdx, old => ({
                  ...old,
                  question: e.target.value,
                }))
              }
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white mb-3"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((option, oIdx) => (
                <div
                  key={oIdx}
                  className="flex items-center gap-2"
                >
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-300 font-bold flex items-center justify-center">
                    {String.fromCharCode(65 + oIdx)}
                  </span>

                  <input
                    value={option}
                    onChange={(e) =>
                      updateEditingQuestion(qIdx, old => ({
                        ...old,
                        options: old.options.map(
                          (item: string, index: number) =>
                            index === oIdx
                              ? e.target.value
                              : item
                        ),
                      }))
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-xs text-slate-300 font-bold mb-1">
                ĐÁP ÁN ĐÚNG
              </label>

              <select
                value={q.correctAnswer}
                onChange={(e) =>
                  updateEditingQuestion(qIdx, old => ({
                    ...old,
                    correctAnswer: Number(e.target.value),
                  }))
                }
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value={0}>A</option>
                <option value={1}>B</option>
                <option value={2}>C</option>
                <option value={3}>D</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="block text-xs text-slate-300 font-bold mb-1">
                GIẢI THÍCH
              </label>

              <textarea
                value={q.explanation || ''}
                onChange={(e) =>
                  updateEditingQuestion(qIdx, old => ({
                    ...old,
                    explanation: e.target.value,
                  }))
                }
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setEditingGame(null)}
          className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
        >
          HỦY
        </button>

        <button
          type="button"
          onClick={handleSaveEditedGame}
          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
        >
          LƯU THAY ĐỔI
        </button>
      </div>

    </div>
  </div>
)}

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

      {/* FEATURE 13: MODAL CHỌN TRÒ CHƠI CẦN XUẤT CHO LỚP */}
      {quickClassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1728] border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  XUẤT EXCEL CHO LỚP {quickClassModal.name}
                </h3>
              </div>
              <button
                onClick={() => setQuickClassModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Chọn trò chơi / bài học bạn muốn xuất kết quả cho <strong className="text-cyan-300">{quickClassModal.name}</strong> ({quickClassModal.studentCount} học sinh):
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSidebarTab('results');
                  setQuickClassModal(null);
                }}
                className="w-full p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-amber-300 group-hover:text-amber-200">
                    ⭐ TẤT CẢ TRÒ CHƠI CỦA LỚP
                  </span>
                  <span className="text-[10px] bg-purple-900 text-purple-200 px-2 py-0.5 rounded font-mono">
                    Tổng hợp
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Bảng điểm đầy đủ tất cả các bài đã làm kèm điểm trung bình và tỷ lệ hoàn thành
                </div>
              </button>

              {games.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleExportClassDirect(quickClassModal, g)}
                  className="w-full p-3 rounded-xl bg-[#07111E] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-white line-clamp-1">{g.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {g.subject} • {g.textbook} • {g.questions.length} câu
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => {
                  setSidebarTab('results');
                  setQuickClassModal(null);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold"
              >
                Mở tùy chọn nâng cao & xem trước ➔
              </button>
              <button
                onClick={() => setQuickClassModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Connection & SQL Modal */}
      <SupabaseSetupModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};
