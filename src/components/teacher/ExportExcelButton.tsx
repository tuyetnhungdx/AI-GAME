import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Loader2, 
  Layers, 
  GraduationCap, 
  Gamepad2, 
  X, 
  Check, 
  Sparkles,
  FileCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { ClassGroup, Game, Room, ScorePolicy } from '../../types';
import { demoClasses, demoGames, demoRoomTIN012 } from '../../data/initialData';
import { sounds } from '../../utils/audio';
import { 
  buildClassExportSummary, 
  downloadWorkbook, 
  generateExportFilename, 
  generateFullClassExcel 
} from '../../utils/excelExport';

export interface ExportExcelButtonProps {
  classes?: ClassGroup[];
  games?: Game[];
  currentRoom?: Room | null;
  defaultClassId?: string;
  defaultGameId?: string;
  variant?: 'primary' | 'secondary' | 'header' | 'compact';
  className?: string;
  buttonText?: string;
  onExportComplete?: (filename: string) => void;
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  classes = demoClasses,
  games = demoGames,
  currentRoom,
  defaultClassId,
  defaultGameId,
  variant = 'header',
  className = '',
  buttonText = 'XUẤT EXCEL',
  onExportComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Initialize selected class & game
  const initialClassId = useMemo(() => {
    if (defaultClassId) return defaultClassId;
    if (currentRoom?.participants?.[0]?.className) {
      const match = classes.find(c => c.name.toLowerCase() === currentRoom.participants[0].className.toLowerCase());
      if (match) return match.id;
    }
    return classes[0]?.id || '12A1';
  }, [defaultClassId, currentRoom, classes]);

  const initialGameId = useMemo(() => {
    if (defaultGameId) return defaultGameId;
    if (currentRoom?.gameId) return currentRoom.gameId;
    return games[0]?.id || 'game-racing-tin12';
  }, [defaultGameId, currentRoom, games]);

  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [selectedGameId, setSelectedGameId] = useState<string>(initialGameId);
  const [scorePolicy, setScorePolicy] = useState<ScorePolicy>('highest');
  const [sortBy, setSortBy] = useState<'roster' | 'score'>('roster');

  // Selected Class & Game Objects
  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId || c.name.toLowerCase() === selectedClassId.toLowerCase()) || classes[0];
  }, [classes, selectedClassId]);

  const selectedGame = useMemo(() => {
    return games.find(g => g.id === selectedGameId) || games[0];
  }, [games, selectedGameId]);

  // Expected filename
  const previewFilename = useMemo(() => {
    return generateExportFilename(selectedClass?.name || 'Lop', selectedGame?.title || 'Game');
  }, [selectedClass, selectedGame]);

  const handleOpenModal = () => {
    sounds.playSpinClick();
    setExportSuccess(null);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    sounds.playSpinClick();
    setIsOpen(false);
  };

  // Perform Excel Generation & Download
  const handleExportExcel = async () => {
    if (!selectedClass || !selectedGame) return;

    try {
      setIsExporting(true);
      setExportSuccess(null);
      sounds.playSpinClick();

      // Determine participants list to use:
      // If current room has participants for this class/game, use them.
      // Otherwise use demoRoomTIN012 participants as standard base.
      let participants = currentRoom?.participants || [];
      if (!participants || participants.length === 0) {
        participants = demoRoomTIN012.participants;
      }

      const roomCode = currentRoom?.roomCode || 'TIN012';

      // 1. Build summary structure
      const summary = buildClassExportSummary(
        selectedClass,
        selectedGame,
        roomCode,
        participants,
        scorePolicy,
        sortBy,
        'Cô Trần Thị Tuyết Nhung',
        'TRƯỜNG THPT NGUYỄN DỤC'
      );

      // 2. Generate 3-sheet workbook: "Tổng hợp", "Chi tiết từng câu", "Phân tích câu hỏi"
      const questions = selectedGame.questions && selectedGame.questions.length > 0 
        ? selectedGame.questions 
        : (currentRoom?.game?.questions || []);

      const workbook = await generateFullClassExcel(summary, questions, {
        schoolName: 'TRƯỜNG THPT NGUYỄN DỤC',
        teacherName: 'Cô Trần Thị Tuyết Nhung',
        includeDetails: true,
        includeAnalysis: true,
      });

      // 3. Trigger download
      const filename = generateExportFilename(selectedClass.name, selectedGame.title);
      await downloadWorkbook(workbook, filename);

      sounds.playFanfare();
      setExportSuccess(filename);
      if (onExportComplete) {
        onExportComplete(filename);
      }
    } catch (error: any) {
      console.error('Lỗi khi xuất file Excel:', error);
      alert(`Không thể tạo file Excel: ${error.message || 'Lỗi không xác định'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Button styling variants
  let buttonClass = 'px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer';

  if (variant === 'compact') {
    buttonClass = 'px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer';
  } else if (variant === 'secondary') {
    buttonClass = 'px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer';
  }

  if (className) {
    buttonClass = `${buttonClass} ${className}`;
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        className={buttonClass}
        title="Xuất bảng điểm và phân tích kết quả ra file Excel (.xlsx)"
      >
        <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
        <span>{buttonText}</span>
      </button>

      {/* Modal Dialog for Class & Game Selection */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-[#0B132B] border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    XUẤT KẾT QUẢ HỌC TẬP RA EXCEL
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      .XLSX
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Báo cáo chuẩn sư phạm gồm 3 sheet: Tổng hợp, Chi tiết từng câu & Phân tích câu hỏi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              
              {/* Step 1: Chọn Lớp học */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  1. CHỌN LỚP HỌC CẦN XUẤT
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {classes.map((cls) => {
                    const isSelected = selectedClassId === cls.id || selectedClassId === cls.name;
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          sounds.playSpinClick();
                          setSelectedClassId(cls.id);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-md shadow-emerald-950'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-sm font-black flex items-center justify-between">
                          <span>{cls.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[11px] opacity-75 mt-0.5">
                          {cls.students.length} học sinh
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Chọn Trò chơi / Bộ câu hỏi */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" />
                  2. CHỌN BÀI KIỂM TRA / TRÒ CHƠI
                </label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full bg-[#060D17] border border-slate-700 focus:border-emerald-400 text-white px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm outline-none transition-colors"
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.questions?.length || 10} câu hỏi - Môn {g.subject || 'Tin học'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 3: Tùy chọn sắp xếp & tính điểm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Chính sách tính điểm
                  </label>
                  <select
                    value={scorePolicy}
                    onChange={(e) => setScorePolicy(e.target.value as ScorePolicy)}
                    className="w-full bg-[#060D17] border border-slate-800 focus:border-emerald-400 text-slate-300 px-3 py-1.5 rounded-xl text-xs outline-none"
                  >
                    <option value="highest">Lấy điểm cao nhất</option>
                    <option value="latest">Lấy lần chơi gần nhất</option>
                    <option value="first">Lấy lần chơi đầu tiên</option>
                    <option value="average">Lấy điểm trung bình các lần</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Sắp xếp danh sách
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'roster' | 'score')}
                    className="w-full bg-[#060D17] border border-slate-800 focus:border-emerald-400 text-slate-300 px-3 py-1.5 rounded-xl text-xs outline-none"
                  >
                    <option value="roster">Theo số thứ tự Sổ điểm (STT 1 &rarr; n)</option>
                    <option value="score">Theo điểm số từ cao xuống thấp</option>
                  </select>
                </div>
              </div>

              {/* 3 Sheets Preview Card */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Layers className="w-3.5 h-3.5" />
                    FILE EXCEL XUẤT RA GỒM ĐỦ 3 SHEET:
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    Lớp: {selectedClass?.name} | {selectedClass?.students?.length || 0} HS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      1
                    </span>
                    <div>
                      <div className="font-bold text-white">Tổng hợp</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Điểm hệ 10, xếp hạng, số câu đúng/sai, % hoàn thành
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      2
                    </span>
                    <div>
                      <div className="font-bold text-white">Chi tiết từng câu</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Câu hỏi, phương án HS chọn, đáp án đúng, đúng/sai
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      3
                    </span>
                    <div>
                      <div className="font-bold text-white">Phân tích câu hỏi</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Tỷ lệ đúng, thời gian TB, nhận biết/vận dụng, đánh giá
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/80 font-mono">
                  <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">Tên file: <strong className="text-emerald-300">{previewFilename}</strong></span>
                </div>
              </div>

              {/* Success Notification */}
              {exportSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Đã tải thành công file: <strong>{exportSuccess}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={isExporting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-950 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ĐANG ĐÓNG GÓI EXCEL...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>TẢI FILE EXCEL (.XLSX)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
