import React, { useRef, useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  Bot, 
  Check, 
  CheckCircle2, 
  Clipboard, 
  Copy, 
  Database, 
  Download, 
  Edit3, 
  FileSpreadsheet, 
  FileText, 
  FileType, 
  Gamepad2, 
  HelpCircle, 
  Lightbulb, 
  Loader2, 
  Plus, 
  RefreshCw, 
  Save, 
  Search, 
  Sparkles, 
  Pencil,
  Trash2, 
  Upload, 
  Wand2, 
  X,
  XCircle
} from 'lucide-react';
import { Difficulty, Game, GameType, Grade, Question, Subject } from '../../types';
import { sounds } from '../../utils/audio';
import { 
  generateCsvTemplate, 
  parseCSVQuestions, 
  parseDocxFile, 
  parsePdfFile, 
  parseRawTextQuestions, 
  ParsedQuestionResult 
} from '../../utils/questionParser';
import { CodeBlock } from '../CodeBlock';

interface TeacherQuestionImporterProps {
  subject: Subject;
  grade: Grade;
  textbook: string;
  lessonTitle: string;
  onProceedToGameSelection: (questions: Question[]) => void;
  onSaveToQuestionBank?: (questions: Question[], metadata: any) => void;
  onSwitchToAI: () => void;
}

export const TeacherQuestionImporter: React.FC<TeacherQuestionImporterProps> = ({
  subject,
  grade,
  textbook,
  lessonTitle,
  onProceedToGameSelection,
  onSaveToQuestionBank,
  onSwitchToAI,
}) => {
  // Input Method: 1: Direct Manual, 2: Paste Raw Text, 3: Excel/CSV, 4: Word, 5: PDF
  const [activeMethod, setActiveMethod] = useState<'direct' | 'paste' | 'excel' | 'word' | 'pdf'>('paste');

  // Parsed questions state
  const [questionsList, setQuestionsList] = useState<ParsedQuestionResult[]>([]);

  // Method 1: Direct Manual entry temporary state
  const [manualQuestion, setManualQuestion] = useState<ParsedQuestionResult>({
    id: 'manual-draft',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    hasUndeterminedAnswer: false,
    needsReview: false,
    explanation: '',
    difficulty: 'Thông hiểu',
    topic: lessonTitle,
    codeSnippet: '',
  });

  // Method 2: Paste textarea state with rich Vietnamese example
  const [pasteRawText, setPasteRawText] = useState<string>(
`Câu 1. Thiết bị mạng nào hoạt động ở tầng Network và có chức năng định tuyến gói tin giữa các mạng khác nhau?
A. Router (Bộ định tuyến)
B. Hub (Bộ chia tín hiệu)
C. Switch tầng 2 (Bộ chuyển mạch)
D. Repeater (Bộ lặp)
Đáp án: A
Giải thích: Router hoạt động ở tầng Network (Tầng 3) và định tuyến dữ liệu theo địa chỉ IP.
Mức độ: Nhận biết
Chủ đề: Mạng máy tính

Câu 2. Xác thực hai yếu tố (2FA) mang lại lợi ích nổi bật nào trong an toàn thông tin?
A. Tăng cường bảo mật tài khoản
B. Tăng gấp đôi tốc độ Internet
C. Tăng dung lượng bộ nhớ RAM
D. Tự động thay đổi địa chỉ IP
Đáp án: A
Giải thích: 2FA yêu cầu thêm mã xác thực dùng một lần (OTP) giúp chống lộ mật khẩu.
Mức độ: Thông hiểu
Chủ đề: An toàn thông tin

Câu 3. Xem xét đoạn mã Python sau:
\`\`\`python
s = [1, 2, 3]
s.append(4)
print(len(s))
\`\`\`
Kết quả in ra màn hình là gì?
A. 4
B. 3
C. 5
D. Lỗi cú pháp
Đáp án: A
Giải thích: Phương thức append thêm phần tử 4 vào cuối list s, độ dài s là 4.
Mức độ: Vận dụng
Chủ đề: Lập trình Python`
  );

  // File parsing states
  const [fileName, setFileName] = useState<string>('');
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Editing state for specific question
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // AI Assistant Modal state
  const [aiAssistantTarget, setAiAssistantTarget] = useState<{
    index: number;
    question: ParsedQuestionResult;
    action: 'audit' | 'distractors' | 'explanation' | 'harder' | 'easier' | 'similar';
  } | null>(null);
  const [aiAssistantLoading, setAiAssistantLoading] = useState<boolean>(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // Save to Question Bank Modal state
  const [showSaveBankModal, setShowSaveBankModal] = useState<boolean>(false);
  const [bankSemester, setBankSemester] = useState<string>('Học kỳ 1');
  const [bankSchoolYear, setBankSchoolYear] = useState<string>('2025 - 2026');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // File upload input refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =================== ACTIONS & PARSING HANDLERS ===================

  // Parse Raw Text
  const handleParsePasteText = () => {
    setParseError(null);
    if (!pasteRawText.trim()) {
      setParseError('Vui lòng dán nội dung bộ câu hỏi vào ô bên dưới.');
      return;
    }

    try {
      const parsed = parseRawTextQuestions(pasteRawText);
      if (parsed.length === 0) {
        setParseError('Không nhận diện được câu hỏi nào. Vui lòng kiểm tra định dạng theo mẫu.');
        return;
      }
      setQuestionsList(parsed);
      sounds.playFanfare();
    } catch (err: any) {
      setParseError('Lỗi phân tích cú pháp: ' + (err.message || 'Vui lòng kiểm tra lại cấu trúc văn bản.'));
    }
  };

  // Add Manual Question
  const handleAddManualQuestion = () => {
    if (!manualQuestion.question.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi.');
      return;
    }
    const newQ: ParsedQuestionResult = {
      ...manualQuestion,
      id: `manual-${Date.now()}-${questionsList.length + 1}`,
      hasUndeterminedAnswer: manualQuestion.correctAnswer < 0,
      needsReview: manualQuestion.correctAnswer < 0,
    };
    setQuestionsList([...questionsList, newQ]);
    sounds.playCorrect();

    // Reset manual draft
    setManualQuestion({
      id: 'manual-draft',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      hasUndeterminedAnswer: false,
      needsReview: false,
      explanation: '',
      difficulty: 'Thông hiểu',
      topic: lessonTitle,
      codeSnippet: '',
    });
  };

  // Download Sample CSV
  const handleDownloadCsvTemplate = () => {
    const csvData = generateCsvTemplate();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mau_Bo_Cau_Hoi_${subject}_THPT_NguyenDuc.csv`;
    a.click();
    URL.revokeObjectURL(url);
    sounds.playSpinClick();
  };

  // File input change (CSV, Excel, Word, PDF)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsingFile(true);
    setParseError(null);
    sounds.playSpinClick();

    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      let parsed: ParsedQuestionResult[] = [];

      if (ext === 'csv') {
        const text = await file.text();
        parsed = parseCSVQuestions(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        // Read text or CSV equivalent
        const text = await file.text();
        parsed = parseCSVQuestions(text);
      } else if (ext === 'docx' || ext === 'doc') {
        parsed = await parseDocxFile(file);
      } else if (ext === 'pdf') {
        parsed = await parsePdfFile(file);
      } else {
        // Default text fallback
        const text = await file.text();
        parsed = parseRawTextQuestions(text);
      }

      if (parsed.length === 0) {
        throw new Error('Không trích xuất được câu hỏi từ tệp tin. Vui lòng kiểm tra định dạng tệp.');
      }

      setQuestionsList(parsed);
      sounds.playFanfare();
    } catch (err: any) {
      setParseError(err.message || 'Không thể đọc tệp tin. Vui lòng thử dùng cách dán trực tiếp.');
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Edit / Delete / Duplicate / Reorder questions
  const handleDeleteQuestion = (idx: number) => {
    const updated = questionsList.filter((_, i) => i !== idx);
    setQuestionsList(updated);
  };

  const handleDuplicateQuestion = (idx: number) => {
    const target = questionsList[idx];
    const copy: ParsedQuestionResult = {
      ...target,
      id: `copy-${Date.now()}`,
      question: `[Bản sao] ${target.question}`,
    };
    const updated = [...questionsList];
    updated.splice(idx + 1, 0, copy);
    setQuestionsList(updated);
  };

  const handleMoveQuestion = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questionsList.length) return;
    const updated = [...questionsList];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setQuestionsList(updated);
  };

  const handleSetCorrectAnswer = (questionIdx: number, answerIdx: number) => {
    const updated = [...questionsList];
    updated[questionIdx] = {
      ...updated[questionIdx],
      correctAnswer: answerIdx,
      hasUndeterminedAnswer: false,
      needsReview: false,
      reviewReason: undefined,
    };
    setQuestionsList(updated);
    sounds.playSpinClick();
  };

  // AI Assistant action trigger
  const handleOpenAiAssistant = async (
    idx: number,
    action: 'audit' | 'distractors' | 'explanation' | 'harder' | 'easier' | 'similar'
  ) => {
    const q = questionsList[idx];
    setAiAssistantTarget({ index: idx, question: q, action });
    setAiAssistantLoading(true);
    setAiSuggestion(null);
    sounds.playSpinClick();

    try {
      if (action === 'distractors') {
        const correctText = q.correctAnswer >= 0 ? q.options[q.correctAnswer] : q.options[0];
        const res = await fetch('/api/ai/generate-distractors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionText: q.question, correctAnswerText: correctText, topic: q.topic }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.distractors)) {
          // Reconstruct 4 options keeping correct answer intact
          const newOpts = [...q.options];
          let distIdx = 0;
          for (let o = 0; o < 4; o++) {
            if (o !== q.correctAnswer) {
              newOpts[o] = data.distractors[distIdx++] || newOpts[o];
            }
          }
          setAiSuggestion({
            ...q,
            options: newOpts,
          });
        }
      } else if (action === 'explanation') {
        const res = await fetch('/api/ai/generate-explanation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionText: q.question, options: q.options, correctAnswerIndex: q.correctAnswer }),
        });
        const data = await res.json();
        if (data.success) {
          setAiSuggestion({
            ...q,
            explanation: data.explanation,
          });
        }
      } else {
        // Rewrite harder, easier, similar, audit
        const res = await fetch('/api/ai/rewrite-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q, action }),
        });
        const data = await res.json();
        if (data.success && data.question) {
          setAiSuggestion(data.question);
        }
      }
    } catch (e) {
      console.warn('AI assistance error:', e);
    } finally {
      setAiAssistantLoading(false);
    }
  };

  // Accept AI Suggestion
  const handleAcceptAiSuggestion = () => {
    if (!aiAssistantTarget || !aiSuggestion) return;
    const updated = [...questionsList];
    updated[aiAssistantTarget.index] = {
      ...aiAssistantTarget.question,
      ...aiSuggestion,
    };
    setQuestionsList(updated);
    sounds.playCorrect();
    setAiAssistantTarget(null);
  };

  // Save to Question Bank
  const handleSaveToBank = () => {
    if (questionsList.length === 0) return;
    if (onSaveToQuestionBank) {
      onSaveToQuestionBank(questionsList, {
        subject,
        grade,
        textbook,
        lesson: lessonTitle,
        semester: bankSemester,
        schoolYear: bankSchoolYear,
        count: questionsList.length,
      });
    }
    setSaveSuccessMsg(`Đã lưu thành công ${questionsList.length} câu hỏi vào Ngân hàng câu hỏi môn ${subject}!`);
    sounds.playFanfare();
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setShowSaveBankModal(false);
    }, 2000);
  };

  // Validate before proceeding to Game Selection
  const handleProceedToGames = () => {
    if (questionsList.length === 0) {
      alert('Vui lòng nhập ít nhất 1 câu hỏi.');
      return;
    }

    // Check if any question has undetermined answer
    const undeterminedCount = questionsList.filter((q) => q.correctAnswer < 0).length;
    if (undeterminedCount > 0) {
      const confirmProceed = window.confirm(
        `Có ${undeterminedCount} câu hỏi chưa xác định đáp án đúng. Thầy/Cô có muốn tự gán đáp án mặc định (phương án A) cho các câu này không?`
      );
      if (!confirmProceed) return;

      const normalized = questionsList.map((q) => (q.correctAnswer < 0 ? { ...q, correctAnswer: 0 } : q));
      onProceedToGameSelection(normalized);
      return;
    }

    onProceedToGameSelection(questionsList);
  };

  const validCount = questionsList.filter((q) => q.correctAnswer >= 0 && q.question.trim().length >= 5).length;
  const reviewCount = questionsList.length - validCount;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 2 Big Primary Mode Choice Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Choice 1: AI Auto Generate */}
        <div
          onClick={onSwitchToAI}
          className="p-6 rounded-3xl bg-[#0A1424] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-transform flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
              LỰA CHỌN 1
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition-colors">
              AI TỰ ĐỘNG TẠO CÂU HỎI
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Dán nội dung bài học hoặc giáo án, Gemini AI tự động sinh câu hỏi trắc nghiệm kèm code và phân bổ độ khó.
            </p>
          </div>
        </div>

        {/* Choice 2: Teacher Has Own Question Set (ACTIVE) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0B1526] to-[#0A1424] border-2 border-purple-500/60 shadow-xl flex items-start gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300 uppercase tracking-wider mb-1">
              <span>LỰA CHỌN 2 (ĐANG CHỌN)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              TÔI ĐÃ CÓ BỘ CÂU HỎI
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Đưa trực tiếp bộ đề có sẵn của Thầy/Cô vào web: Nhập tay, dán nhiều câu, hoặc tải file Word, Excel, PDF.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Input Methods Navigation Tabs */}
      <div className="bg-[#0A1424] border border-cyan-500/30 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyan-400" />
              CHỌN PHƯƠNG THỨC NHẬP BỘ CÂU HỎI
            </h3>
            <p className="text-xs text-slate-400">
              Hệ thống hỗ trợ 5 phương thức đưa câu hỏi linh hoạt, chính xác và tiện lợi nhất
            </p>
          </div>
        </div>

        {/* 5 Method Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            type="button"
            onClick={() => { setActiveMethod('paste'); sounds.playSpinClick(); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMethod === 'paste'
                ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-md font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-lg mb-1">📋</div>
            <div className="text-xs font-bold">CÁCH 2</div>
            <div className="text-[11px] truncate">Dán nhiều câu</div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('direct'); sounds.playSpinClick(); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMethod === 'direct'
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-lg mb-1">✍️</div>
            <div className="text-xs font-bold">CÁCH 1</div>
            <div className="text-[11px] truncate">Nhập trực tiếp</div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('excel'); sounds.playSpinClick(); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMethod === 'excel'
                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-md font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-lg mb-1">📊</div>
            <div className="text-xs font-bold">CÁCH 3</div>
            <div className="text-[11px] truncate">File Excel / CSV</div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('word'); sounds.playSpinClick(); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMethod === 'word'
                ? 'bg-blue-950/60 border-blue-400 text-blue-200 shadow-md font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-lg mb-1">📝</div>
            <div className="text-xs font-bold">CÁCH 4</div>
            <div className="text-[11px] truncate">Tải file Word</div>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMethod('pdf'); sounds.playSpinClick(); }}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeMethod === 'pdf'
                ? 'bg-rose-950/60 border-rose-400 text-rose-200 shadow-md font-bold'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-lg mb-1">📑</div>
            <div className="text-xs font-bold">CÁCH 5</div>
            <div className="text-[11px] truncate">Tải file PDF</div>
          </button>
        </div>

        {/* ================= METHOD 2: DÁN NHIỀU CÂU HỎI ================= */}
        {activeMethod === 'paste' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                DÁN NỘI DUNG TỪ WORD HOẶC TÀI LIỆU VÀO ĐÂY:
              </label>
              <span className="text-[11px] text-slate-400">
                Tự động nhận diện Câu hỏi, A/B/C/D, Đáp án, Giải thích
              </span>
            </div>

            <textarea
              rows={10}
              value={pasteRawText}
              onChange={(e) => setPasteRawText(e.target.value)}
              placeholder="Dán câu hỏi tại đây theo mẫu:
Câu 1. Thiết bị nào dùng để định tuyến dữ liệu giữa các mạng?
A. Router
B. Keyboard
C. Printer
D. Webcam
Đáp án: A
Giải thích: Router dùng để định tuyến dữ liệu giữa các mạng."
              className="w-full bg-[#060D17] border border-slate-700 focus:border-purple-400 text-white p-4 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed outline-none"
            />

            {parseError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleParsePasteText}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>PHÂN TÍCH BỘ CÂU HỎI NGAY</span>
            </button>
          </div>
        )}

        {/* ================= METHOD 1: NHẬP TRỰC TIẾP ================= */}
        {activeMethod === 'direct' && (
          <div className="space-y-4 pt-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-sm text-cyan-300 flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Soạn thảo câu hỏi thủ công
            </h4>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">NỘI DUNG CÂU HỎI</label>
              <textarea
                rows={3}
                value={manualQuestion.question}
                onChange={(e) => setManualQuestion({ ...manualQuestion, question: e.target.value })}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white p-3 rounded-xl text-xs sm:text-sm outline-none"
              />
            </div>

            {/* Optional Code Snippet for Informatics */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ĐOẠN MÃ CODE (MÔN TIN HỌC - TÙY CHỌN)
              </label>
              <textarea
                rows={3}
                value={manualQuestion.codeSnippet || ''}
                onChange={(e) => setManualQuestion({ ...manualQuestion, codeSnippet: e.target.value })}
                placeholder="# Ví dụ code Python hoặc SQL:
s = socket.socket()
s.connect(('192.168.1.1', 80))"
                className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-emerald-300 p-3 rounded-xl text-xs font-mono outline-none"
              />
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <div key={letter} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Phương án {letter}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300">
                      <input
                        type="radio"
                        name="correctAnswerOption"
                        checked={manualQuestion.correctAnswer === idx}
                        onChange={() => setManualQuestion({ ...manualQuestion, correctAnswer: idx })}
                        className="accent-cyan-400"
                      />
                      <span className="text-[11px] font-bold">Đáp án đúng</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={manualQuestion.options[idx]}
                    onChange={(e) => {
                      const newOpts = [...manualQuestion.options];
                      newOpts[idx] = e.target.value;
                      setManualQuestion({ ...manualQuestion, options: newOpts });
                    }}
                    placeholder={`Nhập phương án ${letter}...`}
                    className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 rounded-xl text-xs sm:text-sm outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Explanation & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">GIẢI THÍCH ĐÁP ÁN</label>
                <input
                  type="text"
                  value={manualQuestion.explanation}
                  onChange={(e) => setManualQuestion({ ...manualQuestion, explanation: e.target.value })}
                  placeholder="Giải thích ngắn gọn vì sao đáp án đúng..."
                  className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3 py-2 rounded-xl text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">MỨC ĐỘ NHẬN THỨC</label>
                <select
                  value={manualQuestion.difficulty}
                  onChange={(e) => setManualQuestion({ ...manualQuestion, difficulty: e.target.value as Difficulty })}
                  className="w-full bg-[#060D17] border border-slate-700 text-white px-3 py-2 rounded-xl text-xs outline-none"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddManualQuestion}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow flex items-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ THÊM CÂU HỎI NÀY</span>
            </button>
          </div>
        )}

        {/* ================= METHOD 3: FILE EXCEL / CSV ================= */}
        {activeMethod === 'excel' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-emerald-300">
                  Tải mẫu Excel / CSV chuẩn
                </h4>
                <p className="text-[11px] text-slate-400">
                  File mẫu gồm các cột: STT, Câu hỏi, A, B, C, D, Đáp án, Giải thích, Mức độ, Chủ đề
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Download className="w-4 h-4" />
                <span>TẢI FILE MẪU (.CSV)</span>
              </button>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-3xl bg-slate-900/40 text-center cursor-pointer transition-all hover:bg-emerald-950/10"
            >
              <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <div className="text-sm font-bold text-white">
                Nhấp để tải lên tệp Excel (.xlsx, .xls) hoặc CSV (.csv)
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kéo thả file bảng tính chứa bộ câu hỏi của Thầy/Cô vào đây
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* ================= METHOD 4: FILE WORD (.docx) ================= */}
        {activeMethod === 'word' && (
          <div className="space-y-4 pt-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-blue-500/40 hover:border-blue-400 rounded-3xl bg-slate-900/40 text-center cursor-pointer transition-all hover:bg-blue-950/10"
            >
              <FileType className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-bounce" />
              <div className="text-sm font-bold text-white">
                Nhấp để tải lên tệp Word (.docx, .doc)
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hệ thống tự động đọc đề thi, tách từng câu hỏi và nhận diện đáp án A/B/C/D
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* ================= METHOD 5: FILE PDF (.pdf) ================= */}
        {activeMethod === 'pdf' && (
          <div className="space-y-4 pt-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-rose-500/40 hover:border-rose-400 rounded-3xl bg-slate-900/40 text-center cursor-pointer transition-all hover:bg-rose-950/10"
            >
              <FileText className="w-10 h-10 text-rose-400 mx-auto mb-2 animate-bounce" />
              <div className="text-sm font-bold text-white">
                Nhấp để tải lên tệp PDF đề thi (.pdf)
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trích xuất câu hỏi từ đề cương hoặc tài liệu PDF để giáo viên duyệt
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {isParsingFile && (
          <div className="p-4 bg-cyan-950/50 rounded-2xl border border-cyan-500/40 flex items-center justify-center gap-2 text-cyan-300 text-xs font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Đang đọc và phân tích cấu trúc tệp tin {fileName}...</span>
          </div>
        )}
      </div>

      {/* ================= MÀN HÌNH XEM TRƯỚC (BỘ CÂU HỎI ĐÃ NHẬP) ================= */}
      {questionsList.length > 0 && (
        <div className="space-y-6">
          {/* Summary Status Bar */}
          <div className="bg-[#0A1424] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                DANH SÁCH BỘ CÂU HỎI ĐÃ NHẬP
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Tổng cộng {questionsList.length} câu hỏi
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5 font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{validCount} câu hợp lệ</span>
                </span>
                {reviewCount > 0 && (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{reviewCount} câu cần giáo viên kiểm tra đáp án</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Save Bank & Proceed to Games */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowSaveBankModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                <Save className="w-4 h-4" />
                <span>LƯU VÀO NGÂN HÀNG CÂU HỎI</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToGames}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-2"
              >
                <span>TIẾP TỤC CHỌN TRÒ CHƠI</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {questionsList.map((q, idx) => {
              const hasNoAnswer = q.correctAnswer < 0;
              const letters = ['A', 'B', 'C', 'D'];

              return (
                <div
                  key={q.id || idx}
                  className={`bg-[#0A1424] border rounded-2xl p-5 shadow-lg transition-all ${
                    hasNoAnswer
                      ? 'border-amber-500/60 bg-amber-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono border border-cyan-700/50">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {q.difficulty}
                      </span>
                      {hasNoAnswer && (
                        <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Chưa xác định đáp án – Vui lòng giáo viên kiểm tra</span>
                        </span>
                      )}
                    </div>

                    {/* Order & Modification Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
                        title="Di chuyển lên"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveQuestion(idx, 'down')}
                        disabled={idx === questionsList.length - 1}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
                        title="Di chuyển xuống"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(idx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                        title="Nhân bản câu này"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
<button
  type="button"
  onClick={() => {
    const newQuestion = window.prompt(
      'Sửa nội dung câu hỏi:',
      q.question
    );

    if (newQuestion === null) return;

    const newA = window.prompt(
      'Sửa đáp án A:',
      q.options?.[0] || ''
    );
    if (newA === null) return;

    const newB = window.prompt(
      'Sửa đáp án B:',
      q.options?.[1] || ''
    );
    if (newB === null) return;

    const newC = window.prompt(
      'Sửa đáp án C:',
      q.options?.[2] || ''
    );
    if (newC === null) return;

    const newD = window.prompt(
      'Sửa đáp án D:',
      q.options?.[3] || ''
    );
    if (newD === null) return;

    const newExplanation = window.prompt(
      'Sửa phần giải thích:',
      q.explanation || ''
    );

    setQuestionsList(prev =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              question: newQuestion.trim(),
              options: [
                newA.trim(),
                newB.trim(),
                newC.trim(),
                newD.trim()
              ],
              explanation:
                newExplanation !== null
                  ? newExplanation.trim()
                  : item.explanation
            }
          : item
      )
    );
  }}
  className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-400 border border-blue-500/30"
  title="Sửa câu hỏi"
>
  <Pencil className="w-3.5 h-3.5" />
</button>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-500/30"
                        title="Xóa câu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-sm sm:text-base font-bold text-white mb-2 leading-relaxed">
                    {q.question}
                  </h4>

                  {/* Code snippet if any */}
                  {q.codeSnippet && (
                    <CodeBlock code={q.codeSnippet} language={q.codeLanguage || 'python'} />
                  )}

                  {/* 4 Options with Click-to-set Correct Answer */}
                  <div className="space-y-1.5 my-3">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Nhấp vào chữ cái A, B, C, D để chọn đáp án đúng cho câu này:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((optText, oIdx) => {
                        const isRight = q.correctAnswer === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSetCorrectAnswer(idx, oIdx)}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                              isRight
                                ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-md font-bold'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center text-xs ${
                                  isRight
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {letters[oIdx]}
                              </span>
                              <span>{optText}</span>
                            </div>
                            {isRight && (
                              <span className="text-[10px] text-emerald-400 font-bold">
                                ✓ ĐÚNG
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="text-[11px] text-slate-400 bg-black/25 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                      💡 <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}

                  {/* AI Support Toolbar for Teacher's Question */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono text-purple-300 font-bold flex items-center gap-1 mr-1">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                      <span>AI HỖ TRỢ:</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenAiAssistant(idx, 'distractors')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-medium border border-slate-700"
                    >
                      Viết lại nhiễu B,C,D
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAiAssistant(idx, 'explanation')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium border border-slate-700"
                    >
                      Tạo giải thích
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAiAssistant(idx, 'harder')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-[11px] font-medium border border-slate-700"
                    >
                      Tăng khó
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAiAssistant(idx, 'easier')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-medium border border-slate-700"
                    >
                      Giảm khó
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAiAssistant(idx, 'similar')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-medium border border-slate-700"
                    >
                      Câu tương tự
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Proceed Button */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={handleProceedToGames}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>TIẾP TỤC CHỌN 1 TRONG 10 TRÒ CHƠI</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= AI ASSISTANT COMPARISON / CONFIRMATION MODAL ================= */}
      {aiAssistantTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1728] border-2 border-purple-500/50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-white text-base">
                <Bot className="w-5 h-5 text-purple-400" />
                <span>AI HỖ TRỢ ĐIỀU CHỈNH CÂU HỎI</span>
              </div>
              <button
                type="button"
                onClick={() => setAiAssistantTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiAssistantLoading ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-purple-300">
                  AI đang xử lý yêu cầu mà không làm thay đổi kiến thức gốc của Thầy/Cô...
                </div>
              </div>
            ) : aiSuggestion ? (
              <div className="space-y-4">
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs text-slate-300">
                  ⚠️ <strong>Quyền kiểm soát của giáo viên:</strong> AI chỉ đưa ra phương án gợi ý. Chỉ khi Thầy/Cô bấm <strong>"CHẤP NHẬN THAY ĐỔI"</strong> thì câu hỏi mới được cập nhật.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Original Question */}
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2">
                    <div className="font-bold text-slate-400 uppercase font-mono">BẢN GỐC CỦA GIÁO VIÊN</div>
                    <div className="font-semibold text-white">{aiAssistantTarget.question.question}</div>
                    <div className="space-y-1">
                      {aiAssistantTarget.question.options.map((opt, i) => (
                        <div key={i} className="text-slate-300">
                          {['A', 'B', 'C', 'D'][i]}. {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Suggested Question */}
                  <div className="p-4 bg-purple-950/40 border border-purple-500/50 rounded-xl text-xs space-y-2">
                    <div className="font-bold text-purple-300 uppercase font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>PHƯƠNG ÁN AI ĐỀ XUẤT</span>
                    </div>
                    <div className="font-semibold text-white">{aiSuggestion.question || aiAssistantTarget.question.question}</div>
                    <div className="space-y-1">
                      {(aiSuggestion.options || aiAssistantTarget.question.options).map((opt: string, i: number) => (
                        <div key={i} className="text-purple-200">
                          {['A', 'B', 'C', 'D'][i]}. {opt}
                        </div>
                      ))}
                    </div>
                    {aiSuggestion.explanation && (
                      <div className="text-[11px] text-amber-300 pt-1">
                        💡 {aiSuggestion.explanation}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAiAssistantTarget(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    GIỮ NGUYÊN BẢN GỐC
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptAiSuggestion}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>CHẤP NHẬN THAY ĐỔI</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Không thể tải gợi ý lúc này. Vui lòng thử lại.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SAVE TO QUESTION BANK MODAL ================= */}
      {showSaveBankModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1728] border-2 border-purple-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="font-extrabold text-base text-white mb-1 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              LƯU VÀO NGÂN HÀNG CÂU HỎI
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Lưu bộ {questionsList.length} câu hỏi để tái sử dụng cho nhiều game và bài tập sau này
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">MÔN HỌC & KHỐI LỚP</label>
                <input
                  type="text"
                  value={`${subject} – Lớp ${grade} (${textbook})`}
                  disabled
                  className="w-full bg-[#060D17] border border-slate-800 text-slate-400 p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">TÊN BÀI HỌC / CHỦ ĐỀ</label>
                <input
                  type="text"
                  value={lessonTitle}
                  disabled
                  className="w-full bg-[#060D17] border border-slate-800 text-slate-300 p-2.5 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">HỌC KỲ</label>
                  <select
                    value={bankSemester}
                    onChange={(e) => setBankSemester(e.target.value)}
                    className="w-full bg-[#060D17] border border-slate-700 text-white p-2.5 rounded-xl"
                  >
                    <option value="Học kỳ 1">Học kỳ 1</option>
                    <option value="Học kỳ 2">Học kỳ 2</option>
                    <option value="Cả năm">Cả năm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">NĂM HỌC</label>
                  <input
                    type="text"
                    value={bankSchoolYear}
                    onChange={(e) => setBankSchoolYear(e.target.value)}
                    className="w-full bg-[#060D17] border border-slate-700 text-white p-2.5 rounded-xl"
                  />
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-center">
                  {saveSuccessMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSaveBankModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 font-bold"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveToBank}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow"
                >
                  Xác nhận lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
