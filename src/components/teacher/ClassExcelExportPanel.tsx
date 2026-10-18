import React, { useMemo, useState } from 'react';
import { 
  AlertCircle, 
  ArrowUpDown, 
  Calendar, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Flame, 
  Gamepad2, 
  GraduationCap, 
  Layers, 
  Loader2, 
  RefreshCw, 
  School, 
  Search, 
  Settings2, 
  Sparkles, 
  Trophy, 
  UserCheck, 
  UserX, 
  Users, 
  Zap 
} from 'lucide-react';
import { 
  ClassExportSummary, 
  ClassGroup, 
  ClassStudentRow, 
  Game, 
  Room, 
  ScorePolicy, 
  TimeFilterOption 
} from '../../types';
import { sounds } from '../../utils/audio';
import { 
  buildClassExportSummary, 
  downloadWorkbook, 
  generateAllGamesClassExcel, 
  generateExportFilename, 
  generateFullClassExcel, 
  generateQuickClassExcel 
} from '../../utils/excelExport';

interface ClassExcelExportPanelProps {
  classes: ClassGroup[];
  games: Game[];
  activeRoom: Room | null;
  defaultClassId?: string;
  defaultGameId?: string;
  onViewClassRoom?: (room: Room) => void;
}

export const ClassExcelExportPanel: React.FC<ClassExcelExportPanelProps> = ({
  classes,
  games,
  activeRoom,
  defaultClassId = '12A1',
  defaultGameId = 'game-racing-tin12',
}) => {
  // Step 1: Selected Class ('all' or class name e.g. '12A1')
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);

  // Step 2: Selected Game ('all' for all games or game.id)
  const [selectedGameId, setSelectedGameId] = useState<string>(defaultGameId);

  // Step 3: Filters & Policies
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [scorePolicy, setScorePolicy] = useState<ScorePolicy>('highest');
  const [sortBy, setSortBy] = useState<'roster' | 'score'>('roster');

  // Multi-Class Export State
  const [showMultiClassModal, setShowMultiClassModal] = useState<boolean>(false);
  const [selectedMultiClasses, setSelectedMultiClasses] = useState<string[]>(['12A1', '12A2']);
  const [multiClassFileMode, setMultiClassFileMode] = useState<'single_file' | 'separate_files'>('single_file');

  // Preview Search & Status filter
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'absent'>('all');

  // Export progress state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Selected Class Object
  const currentClass = useMemo(() => {
    return classes.find(c => c.name.toLowerCase() === selectedClassId.toLowerCase() || c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Selected Game Object
  const currentGame = useMemo(() => {
    if (selectedGameId === 'all') return null;
    return games.find(g => g.id === selectedGameId) || games[0];
  }, [games, selectedGameId]);

  // Filter games that belong or are relevant to this class
  const availableGamesForClass = useMemo(() => {
    if (!currentClass) return games;
    // Derive grade from class name e.g. '12A1' -> '12'
    const gradeMatch = currentClass.name.match(/\d+/);
    const grade = gradeMatch ? gradeMatch[0] : '';
    const filtered = games.filter(g => !grade || g.grade === grade);
    return filtered.length > 0 ? filtered : games;
  }, [games, currentClass]);

  // Build Summary and Cross-Reference Data
  const exportSummary: ClassExportSummary | null = useMemo(() => {
    if (!currentClass || selectedGameId === 'all') return null;
    const targetGame = currentGame || games[0];
    const roomCode = activeRoom?.roomCode || 'TIN012';
    const participants = activeRoom?.participants || [];

    return buildClassExportSummary(
      currentClass,
      targetGame,
      roomCode,
      participants,
      scorePolicy,
      sortBy
    );
  }, [currentClass, currentGame, selectedGameId, activeRoom, scorePolicy, sortBy, games]);

  // Filtered students for Preview table
  const displayedStudents: ClassStudentRow[] = useMemo(() => {
    if (!exportSummary) return [];
    let list = [...exportSummary.students];

    // Status filter
    if (statusFilter === 'completed') {
      list = list.filter(s => s.participated);
    } else if (statusFilter === 'absent') {
      list = list.filter(s => !s.participated);
    }

    // Search filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter(s => 
        s.fullName.toLowerCase().includes(q) || 
        s.studentCode.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    }

    return list;
  }, [exportSummary, statusFilter, searchKeyword]);

  // Handlers for exporting Excel
  const handleExportFullExcel = async () => {
    if (!currentClass) return;
    setIsExporting(true);
    setExportFeedback('Đang khởi tạo cấu trúc 3 sheet (Tổng hợp, Chi tiết, Phân tích)...');
    sounds.playSpinClick();

    try {
      if (selectedGameId === 'all') {
        // Export All Games of this class
        setExportFeedback('Đang tổng hợp điểm tất cả trò chơi trong năm học...');
        const studentDataMap = new Map();
        const workbook = await generateAllGamesClassExcel(currentClass, availableGamesForClass, studentDataMap);
        const filename = generateExportFilename(currentClass.name, 'Tat_ca_tro_choi');
        await downloadWorkbook(workbook, filename);
      } else {
        if (!exportSummary || !currentGame) return;
        setExportFeedback('Đang định dạng màu sắc chuẩn THPT và xếp hạng học sinh...');
        const workbook = await generateFullClassExcel(exportSummary, currentGame.questions);
        const filename = generateExportFilename(currentClass.name, currentGame.title);
        await downloadWorkbook(workbook, filename);
      }

      sounds.playFanfare();
      setExportFeedback('Xuất file Excel thành công! Trình duyệt đang tải xuống...');
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setExportFeedback('Lỗi khi xuất file Excel. Vui lòng thử lại.');
      setTimeout(() => setExportFeedback(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportQuickExcel = async () => {
    if (!exportSummary) return;
    setIsExporting(true);
    setExportFeedback('Đang tạo bảng điểm nhanh...');
    sounds.playSpinClick();

    try {
      const workbook = await generateQuickClassExcel(exportSummary);
      const filename = generateExportFilename(currentClass.name, `Nhanh_${currentGame?.title || 'Game'}`);
      await downloadWorkbook(workbook, filename);
      sounds.playFanfare();
      setExportFeedback('Đã tải xuống bảng điểm nhanh!');
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setExportFeedback('Lỗi khi tạo file. Vui lòng thử lại.');
      setTimeout(() => setExportFeedback(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Multi-Class batch export
  const handleExportMultipleClasses = async () => {
    setIsExporting(true);
    setExportFeedback(`Đang xử lý ${selectedMultiClasses.length} lớp học...`);
    sounds.playSpinClick();

    try {
      if (multiClassFileMode === 'single_file') {
        // Build 1 Excel file with multiple sheets for each class
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'AI GAME HỌC TẬP';

        for (const clsName of selectedMultiClasses) {
          const cls = classes.find(c => c.name === clsName);
          if (!cls) continue;
          const targetGame = currentGame || games[0];
          const summary = buildClassExportSummary(
            cls,
            targetGame,
            activeRoom?.roomCode || 'TIN012',
            activeRoom?.participants || [],
            scorePolicy,
            sortBy
          );

          const sheet = workbook.addWorksheet(`Lop ${cls.name}`);
          sheet.addRow([`BÁO CÁO KẾT QUẢ ÔN TẬP – LỚP ${cls.name}`]);
          sheet.addRow([`Trò chơi: ${targetGame.title} | Mã phòng: ${summary.roomCode}`]);
          sheet.addRow([]);
          sheet.addRow(['STT', 'Mã HS', 'Họ tên', 'Lớp', 'Điểm', 'Đúng', 'Sai', 'Tỷ lệ', 'Xếp hạng', 'Trạng thái']);

          summary.students.forEach((st, idx) => {
            sheet.addRow([
              idx + 1,
              st.studentCode,
              st.fullName,
              st.className,
              st.score10 !== null ? st.score10.toFixed(1) : '—',
              st.correctCount ?? '—',
              st.wrongCount ?? '—',
              st.accuracyPercent !== null ? `${Math.round(st.accuracyPercent)}%` : '—',
              st.rank ? `#${st.rank}` : '—',
              st.status,
            ]);
          });
        }

        const filename = `Ket_qua_NhieuLop_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`;
        await downloadWorkbook(workbook, filename);
      } else {
        // Separate files
        for (const clsName of selectedMultiClasses) {
          const cls = classes.find(c => c.name === clsName);
          if (!cls) continue;
          const targetGame = currentGame || games[0];
          const summary = buildClassExportSummary(
            cls,
            targetGame,
            activeRoom?.roomCode || 'TIN012',
            activeRoom?.participants || [],
            scorePolicy,
            sortBy
          );
          const workbook = await generateFullClassExcel(summary, targetGame.questions);
          const filename = generateExportFilename(cls.name, targetGame.title);
          await downloadWorkbook(workbook, filename);
          await new Promise(r => setTimeout(r, 400));
        }
      }

      sounds.playFanfare();
      setShowMultiClassModal(false);
      setExportFeedback('Đã xuất thành công nhiều lớp!');
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setExportFeedback('Lỗi khi xuất nhiều lớp.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#0A1424] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header section with badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              TÍNH NĂNG CHUYÊN SÂU
            </span>
            <span className="text-xs text-slate-400">
              Chỉ 3 thao tác: Chọn lớp ➔ Chọn game ➔ Xuất Excel
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <span>XUẤT KẾT QUẢ THEO LỚP</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
              Chuẩn 3 Sheet
            </span>
          </h2>
        </div>

        {/* Multi-class batch button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMultiClassModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Xuất nhiều lớp (Batch)</span>
          </button>
        </div>
      </div>

      {/* 3 Main Action Steps in Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* STEP 1: CHỌN LỚP */}
        <div className="bg-[#07111E] border border-cyan-500/30 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <School className="w-4 h-4 text-cyan-400" />
              1. CHỌN LỚP
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {currentClass?.studentCount || 0} học sinh
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                sounds.playSpinClick();
              }}
              className="w-full bg-[#0D1B2E] border border-cyan-500/50 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400 transition-all appearance-none cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.name} className="bg-slate-900 text-white font-medium">
                  Lớp {cls.name} ({cls.studentCount} học sinh - Niên khóa {cls.schoolYear})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400">
            Dữ liệu động lấy từ danh sách phụ trách của Cô Tuyết Nhung.
          </p>
        </div>

        {/* STEP 2: CHỌN TRÒ CHƠI */}
        <div className="bg-[#07111E] border border-purple-500/30 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-purple-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              2. CHỌN TRÒ CHƠI / BÀI HỌC
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {availableGamesForClass.length} bài
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedGameId}
              onChange={(e) => {
                setSelectedGameId(e.target.value);
                sounds.playSpinClick();
              }}
              className="w-full bg-[#0D1B2E] border border-purple-500/50 rounded-xl px-3 py-2.5 text-sm font-bold text-white outline-none focus:border-purple-400 transition-all appearance-none cursor-pointer truncate pr-8"
            >
              <option value="all" className="bg-slate-900 text-amber-300 font-bold">
                ⭐ TẤT CẢ TRÒ CHƠI CỦA LỚP (Bảng tổng hợp điểm)
              </option>
              {availableGamesForClass.map((g) => (
                <option key={g.id} value={g.id} className="bg-slate-900 text-white font-medium">
                  {g.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {selectedGameId === 'all' 
              ? 'Xuất tất cả bài học với điểm trung bình và tỷ lệ hoàn thành.' 
              : `${currentGame?.questions.length || 10} câu trắc nghiệm • ${currentGame?.subject}`}
          </p>
        </div>

        {/* STEP 3: BỘ LỌC THỜI GIAN & CHÍNH SÁCH ĐIỂM */}
        <div className="bg-[#07111E] border border-indigo-500/30 rounded-2xl p-4 space-y-2">
          <label className="text-xs font-bold text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              3. THỜI GIAN & CHÍNH SÁCH
            </span>
            <span className="text-[10px] text-emerald-400 font-normal">Mặc định: Tối ưu</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilterOption)}
                className="w-full bg-[#0D1B2E] border border-indigo-500/40 rounded-xl px-2 py-2 text-xs font-medium text-white outline-none focus:border-indigo-400 appearance-none cursor-pointer"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="semester1">Học kỳ I</option>
                <option value="semester2">Học kỳ II</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={scorePolicy}
                onChange={(e) => setScorePolicy(e.target.value as ScorePolicy)}
                className="w-full bg-[#0D1B2E] border border-indigo-500/40 rounded-xl px-2 py-2 text-xs font-medium text-white outline-none focus:border-indigo-400 appearance-none cursor-pointer"
                title="Quy tắc tính điểm khi học sinh chơi nhiều lần"
              >
                <option value="highest">Lấy điểm cao nhất</option>
                <option value="latest">Lấy lần gần nhất</option>
                <option value="first">Lấy lần đầu</option>
                <option value="average">Lấy điểm TB</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Sắp xếp bảng:</span>
            <button
              onClick={() => {
                setSortBy(sortBy === 'roster' ? 'score' : 'roster');
                sounds.playSpinClick();
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortBy === 'roster' ? 'STT Danh sách lớp' : 'Điểm xếp hạng'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. PREVIEW DASHBOARD CARD */}
      {exportSummary && (
        <div className="bg-[#071322] border border-cyan-500/30 rounded-2xl p-5 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                THÔNG TIN XEM TRƯỚC (PREVIEW)
              </span>
              <h3 className="text-base font-bold text-white">
                Lớp {exportSummary.classInfo.name} • {exportSummary.game.title}
              </h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Mã phòng: <strong className="text-cyan-300">{exportSummary.roomCode}</strong>
            </div>
          </div>

          {/* 7 Core Statistical Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div className="bg-[#0B1A2F] border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400">Sĩ số lớp</div>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                {exportSummary.totalStudents}
              </div>
            </div>

            <div className="bg-[#0B1A2F] border border-emerald-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] text-emerald-400 flex items-center justify-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Đã tham gia</span>
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                {exportSummary.participatedCount}
              </div>
            </div>

            <div className="bg-[#0B1A2F] border border-amber-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] text-amber-400 flex items-center justify-center gap-1">
                <UserX className="w-3 h-3" />
                <span>Chưa tham gia</span>
              </div>
              <div className="text-xl font-mono font-bold text-amber-300 mt-0.5">
                {exportSummary.absentCount}
              </div>
            </div>

            <div className="bg-[#0B1A2F] border border-cyan-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400">Điểm trung bình</div>
              <div className="text-xl font-mono font-bold text-cyan-300 mt-0.5">
                {exportSummary.avgScore10.toFixed(1)} <span className="text-xs text-slate-500">/ 10</span>
              </div>
            </div>

            <div className="bg-[#0B1A2F] border border-purple-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400">Tỷ lệ hoàn thành</div>
              <div className="text-xl font-mono font-bold text-purple-300 mt-0.5">
                {exportSummary.completionRatePercent.toFixed(1)}%
              </div>
            </div>

            <div className="bg-[#0B1A2F] border border-indigo-500/30 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-400">Tỷ lệ đúng TB</div>
              <div className="text-xl font-mono font-bold text-indigo-300 mt-0.5">
                {exportSummary.avgAccuracyPercent.toFixed(1)}%
              </div>
            </div>

            <div className="bg-[#0B1A2F] border border-rose-500/30 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400">Cao nhất / Thấp nhất</div>
              <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                {exportSummary.maxScore10.toFixed(1)} / {exportSummary.minScore10.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PREVIEW TABLE (WITH ABSENT STUDENTS PROMINENTLY SHOWN) */}
      <div className="bg-[#07111E] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-sm text-white">
              Bảng đối chiếu học sinh ({displayedStudents.length}/{exportSummary?.totalStudents || 0})
            </h4>
            <span className="text-[11px] text-slate-500">
              (Học sinh chưa tham gia được đánh dấu màu vàng để giáo viên đôn đốc)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({exportSummary?.totalStudents || 0})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === 'completed' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Đã thi ({exportSummary?.participatedCount || 0})
              </button>
              <button
                onClick={() => setStatusFilter('absent')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  statusFilter === 'absent' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Chưa thi ({exportSummary?.absentCount || 0})
              </button>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white outline-none focus:border-cyan-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="overflow-x-auto max-h-72 border border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1626] text-slate-400 uppercase font-mono sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-3">Họ và tên</th>
                <th className="py-2.5 px-3">Mã HS</th>
                <th className="py-2.5 px-3 text-center">Điểm</th>
                <th className="py-2.5 px-3 text-center">Đúng</th>
                <th className="py-2.5 px-3 text-center">Sai</th>
                <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                <th className="py-2.5 px-3 text-center">Thời gian</th>
                <th className="py-2.5 px-3 text-center">Xếp hạng</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#07111E]">
              {displayedStudents.map((st) => {
                const isTop1 = st.rank === 1;
                const isTop2 = st.rank === 2;
                const isTop3 = st.rank === 3;

                return (
                  <tr
                    key={st.studentId}
                    className={`transition-colors ${
                      !st.participated
                        ? 'bg-amber-950/20 text-amber-200/90 hover:bg-amber-950/30'
                        : isTop1
                        ? 'bg-yellow-950/30 text-white font-bold hover:bg-yellow-950/40'
                        : isTop2
                        ? 'bg-slate-800/50 text-white hover:bg-slate-800/70'
                        : isTop3
                        ? 'bg-amber-950/20 text-white hover:bg-amber-950/30'
                        : 'text-slate-300 hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-2 px-3 text-center font-mono text-slate-400">{st.stt}</td>
                    <td className="py-2 px-3 font-semibold text-white flex items-center gap-1.5">
                      <span>{st.fullName}</span>
                      {isTop1 && <span title="Thủ khoa">🥇</span>}
                      {isTop2 && <span title="Á khoa 1">🥈</span>}
                      {isTop3 && <span title="Á khoa 2">🥉</span>}
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-400">{st.studentCode}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold">
                      {st.score10 !== null ? (
                        <span className="text-amber-300">{st.score10.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-400">
                      {st.correctCount !== null ? st.correctCount : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-rose-400">
                      {st.wrongCount !== null ? st.wrongCount : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {st.accuracyPercent !== null ? `${Math.round(st.accuracyPercent)}%` : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">
                      {st.totalTimeSeconds !== null ? `${st.totalTimeSeconds}s` : '—'}
                    </td>
                    <td className="py-2 px-3 text-center font-mono">
                      {st.rank ? (
                        <span className={isTop1 ? 'text-amber-300 font-extrabold' : isTop2 ? 'text-slate-200 font-bold' : isTop3 ? 'text-orange-300 font-bold' : 'text-slate-400'}>
                          #{st.rank}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {st.participated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                          <Check className="w-2.5 h-2.5" />
                          Hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/50">
                          Chưa tham gia
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. PRIMARY EXPORT BUTTONS & STATUS FEEDBACK */}
      <div className="space-y-3 pt-2">
        {exportFeedback && (
          <div className="p-3.5 bg-cyan-950/80 border border-cyan-500/50 rounded-2xl text-xs sm:text-sm text-cyan-200 flex items-center gap-2 animate-fadeIn">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400 flex-shrink-0" />
            <span>{exportFeedback}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Main Button: 📥 XUẤT EXCEL LỚP (3 SHEET) */}
          <button
            onClick={handleExportFullExcel}
            disabled={isExporting || !currentClass}
            className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-900/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Download className="w-5 h-5 text-amber-300" />
            )}
            <span>
              📥 XUẤT EXCEL LỚP {currentClass ? currentClass.name : ''} (3 SHEET ĐẦY ĐỦ)
            </span>
          </button>

          {/* Quick Button: ⚡ EXCEL NHANH */}
          <button
            onClick={handleExportQuickExcel}
            disabled={isExporting || !exportSummary}
            className="py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>⚡ EXCEL NHANH (1 Sheet)</span>
          </button>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          Tên file tự động: <code className="text-cyan-300 font-mono font-semibold">
            {generateExportFilename(currentClass ? currentClass.name : '12A1', currentGame?.title || 'Game')}
          </code>
        </div>
      </div>

      {/* 7. MODAL: BATCH MULTI-CLASS EXPORT */}
      {showMultiClassModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0A1424] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">
                  XUẤT NHIỀU LỚP HỌC CÙNG LÚC
                </h3>
              </div>
              <button
                onClick={() => setShowMultiClassModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Chọn các lớp học bạn muốn xuất kết quả môn Tin học:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {classes.map((cls) => {
                const isSelected = selectedMultiClasses.includes(cls.name);
                return (
                  <button
                    key={cls.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMultiClasses(selectedMultiClasses.filter(c => c !== cls.name));
                      } else {
                        setSelectedMultiClasses([...selectedMultiClasses, cls.name]);
                      }
                      sounds.playSpinClick();
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>Lớp {cls.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                );
              })}
            </div>

            {/* File Structure Mode */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300">Hình thức xuất file:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setMultiClassFileMode('single_file')}
                  className={`p-3 rounded-xl border font-semibold text-center transition-all ${
                    multiClassFileMode === 'single_file'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>1 File Excel duy nhất</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Mỗi lớp là một sheet riêng</div>
                </button>

                <button
                  onClick={() => setMultiClassFileMode('separate_files')}
                  className={`p-3 rounded-xl border font-semibold text-center transition-all ${
                    multiClassFileMode === 'separate_files'
                      ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>Nhiều file riêng biệt</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Mỗi lớp tải về 1 file độc lập</div>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setShowMultiClassModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExportMultipleClasses}
                disabled={selectedMultiClasses.length === 0 || isExporting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4" />}
                <span>Bắt đầu xuất ({selectedMultiClasses.length} lớp)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
