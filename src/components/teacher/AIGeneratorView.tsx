import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  Bot, 
  Check, 
  Code2, 
  Copy, 
  Edit3, 
  Flame, 
  Gamepad2, 
  Loader2, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  TrendingDown, 
  TrendingUp, 
  Wand2 
} from 'lucide-react';
import { Difficulty, Game, GameType, Grade, Question, Subject } from '../../types';
import { sounds } from '../../utils/audio';
import { CodeBlock } from '../CodeBlock';

interface AIGeneratorViewProps {
  onPublishGame: (game: Game) => void;
}

export const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({ onPublishGame }) => {
  // Step 1: Input Form state
  const [subject, setSubject] = useState<Subject>('Tin học');
  const [grade, setGrade] = useState<Grade>('12');
  const [textbook, setTextbook] = useState('Kết nối tri thức');
  const [lessonTitle, setLessonTitle] = useState('Bài 4: Mạng máy tính và Internet');
  const [content, setContent] = useState(
    `Nội dung trọng tâm:
1. Khái niệm và cấu trúc mạng máy tính: Địa chỉ IPv4 (32 bit), IPv6, phân dải tên miền DNS.
2. Giao thức mạng: TCP/IP, HTTP (cổng 80), HTTPS (cổng 443 với mã hóa SSL/TLS).
3. Lập trình mạng căn bản với Python: Thư viện socket, tạo kết nối Client - Server TCP (SOCK_STREAM), bắt ngoại lệ socket.error.
4. Thiết bị mạng: Router (tầng 3 - định tuyến), Switch, Hub.
5. Điện toán đám mây và an toàn thông tin mạng.`
  );
  const [count, setCount] = useState<number>(10);
  const [difficultyDistribution, setDifficultyDistribution] = useState('30% Nhận biết, 40% Thông hiểu, 30% Vận dụng');

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Step 2: Questions Preview & Editor state
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Step 3: Game Type Selection
  const [selectedGameType, setSelectedGameType] = useState<GameType>('racing');

  const GAME_MODES: { type: GameType; title: string; icon: string; desc: string }[] = [
    { type: 'racing', title: 'Đường đua kiến thức', icon: '🏎️', desc: 'Đua xe tốc hành, câu đúng tăng tốc, vượt đối thủ' },
    { type: 'wheel', title: 'Vòng quay may mắn', icon: '🎡', desc: 'Quay vòng số nhân điểm, bốc thăm câu hỏi bất ngờ' },
    { type: 'bomb', title: 'Gỡ bom kiến thức', icon: '💣', desc: 'Đếm ngược 20s kịch tính, cắt đúng dây gỡ bom an toàn' },
    { type: 'puzzle', title: 'Lật mảnh ghép', icon: '🧩', desc: 'Mỗi câu đúng lật 1 mảnh ghép hé lộ bức tranh công nghệ bí mật' },
    { type: 'space', title: 'Chinh phục vũ trụ', icon: '🚀', desc: 'Phi thuyền không gian vượt hành tinh tiến đến dải Ngân Hà' },
    { type: 'castle', title: 'Vượt chướng ngại vật', icon: '🏰', desc: 'Vượt cầu treo, vượt núi lửa, công phá cổng thành tri thức' },
    { type: 'treasure', title: 'Săn kho báu', icon: '💎', desc: 'Bản đồ số truy tìm 4 chìa khóa mở hòm vàng bí mật' },
    { type: 'arena', title: 'Đấu trường kiến thức', icon: '⚔️', desc: 'Chiến trường đồng đội Đội Đỏ vs Đội Xanh giằng co điểm số' },
  ];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    sounds.playSpinClick();

    // 3-phase loading animation
    setLoadingStep('AI đang phân tích cấu trúc bài học và chuẩn kiến thức THPT...');
    await new Promise(r => setTimeout(r, 600));

    setLoadingStep('Đang khởi tạo các phương án nhiễu khoa học và code lập trình...');
    await new Promise(r => setTimeout(r, 600));

    setLoadingStep('Đang kiểm tra đáp án đúng và phân bổ mức độ nhận thức...');

    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          textbook,
          lessonTitle,
          content,
          count,
          difficultyDistribution,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        sounds.playFanfare();
      } else {
        throw new Error('Không thể tạo câu hỏi');
      }
    } catch {
      setErrorMsg('Không thể tạo câu hỏi lúc này. Vui lòng bấm thử lại hoặc kiểm tra kết nối mạng.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewriteAI = async (q: Question, action: 'harder' | 'easier' | 'similar') => {
    try {
      sounds.playSpinClick();
      const res = await fetch('/api/ai/rewrite-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, action }),
      });
      const data = await res.json();
      if (data.success && data.question && generatedQuestions) {
        setGeneratedQuestions(generatedQuestions.map(item => item.id === q.id ? data.question : item));
        sounds.playCorrect();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (!generatedQuestions) return;
    setGeneratedQuestions(generatedQuestions.filter(q => q.id !== id));
  };

  const handleDuplicateQuestion = (q: Question) => {
    if (!generatedQuestions) return;
    const copy: Question = {
      ...q,
      id: `copy-${Date.now()}`,
      question: `[Bản sao] ${q.question}`,
    };
    setGeneratedQuestions([...generatedQuestions, copy]);
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (!generatedQuestions) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= generatedQuestions.length) return;
    const newArr = [...generatedQuestions];
    const [moved] = newArr.splice(idx, 1);
    newArr.splice(targetIdx, 0, moved);
    setGeneratedQuestions(newArr);
  };

  const handlePublish = () => {
    if (!generatedQuestions || generatedQuestions.length === 0) return;

    const newGame: Game = {
      id: `game-${Date.now()}`,
      teacherId: 'teacher-tn-01',
      title: `${GAME_MODES.find(g => g.type === selectedGameType)?.title} – ${subject} ${grade} – ${lessonTitle}`,
      subject,
      grade,
      textbook,
      lesson: lessonTitle,
      gameType: selectedGameType,
      questions: generatedQuestions,
      settings: {
        timePerQuestion: 20,
        showExplanation: true,
        allowRetry: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        musicEnabled: true,
        soundEffects: true,
        mode: 'live_class',
      },
      createdAt: new Date().toISOString(),
      playCount: 0,
    };

    sounds.playFanfare();
    onPublishGame(newGame);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>CÔNG CỤ SOẠN BÀI THÔNG MINH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            TẠO TRÒ CHƠI BẰNG AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Nhập bài học – AI tự động sinh câu hỏi chuẩn THPT – Chọn kiểu trò chơi – Xuất bản mã phòng
          </p>
        </div>

        {generatedQuestions && (
          <button
            onClick={() => setGeneratedQuestions(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 self-start md:self-auto flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tạo bộ câu hỏi khác</span>
          </button>
        )}
      </div>

      {/* STEP 1: FORM INPUT (Shown when no generated questions yet) */}
      {!generatedQuestions && (
        <div className="bg-[#0A1424] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                MÔN HỌC
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
                className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none"
              >
                <option value="Tin học">Tin học (Ưu tiên hỗ trợ Code)</option>
                <option value="Toán">Toán học</option>
                <option value="Vật lí">Vật lí</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Sinh học">Sinh học</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Lịch sử">Lịch sử</option>
                <option value="Địa lí">Địa lí</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                KHỐI LỚP
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none"
              >
                <option value="12">Lớp 12 (Thi TN THPT & Hướng nghiệp)</option>
                <option value="11">Lớp 11 (Python & Cấu trúc dữ liệu)</option>
                <option value="10">Lớp 10 (Kiến thức cơ bản)</option>
              </select>
            </div>

            {/* Textbook */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                BỘ SÁCH GIÁO KHOA
              </label>
              <input
                type="text"
                value={textbook}
                onChange={(e) => setTextbook(e.target.value)}
                placeholder="VD: Kết nối tri thức / Cánh Diều"
                className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          {/* Lesson Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              TÊN BÀI HỌC
            </label>
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="VD: Bài 4 – Tin học 12: Mạng máy tính và Internet"
              className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-4 py-3 rounded-xl text-sm outline-none font-medium"
            />
          </div>

          {/* Knowledge Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                NỘI DUNG KIẾN THỨC BÀI HỌC / GIÁO ÁN
              </label>
              <span className="text-[11px] text-slate-500">
                Gõ hoặc dán nội dung SGK, giáo án để AI phân tích
              </span>
            </div>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Dán nội dung bài học, định nghĩa, đoạn mã code ví dụ hoặc tóm tắt kiến thức cốt lõi..."
              className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white p-4 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed outline-none"
            />
          </div>

          {/* Question Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                SỐ LƯỢNG CÂU HỎI
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      count === num
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {num} câu
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                PHÂN BỔ ĐỘ KHÓ
              </label>
              <select
                value={difficultyDistribution}
                onChange={(e) => setDifficultyDistribution(e.target.value)}
                className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm outline-none"
              >
                <option value="30% Nhận biết, 40% Thông hiểu, 30% Vận dụng">
                  ✨ AI Tự phân bổ (30% NB, 40% TH, 30% VD)
                </option>
                <option value="50% Nhận biết, 50% Thông hiểu">
                  Dành cho khởi động / Củng cố nhanh (50% NB, 50% TH)
                </option>
                <option value="30% Thông hiểu, 40% Vận dụng, 30% Vận dụng cao">
                  Đấu trường nâng cao (30% TH, 40% VD, 30% VDC)
                </option>
              </select>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAI}
                className="text-xs underline font-bold hover:text-white"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* AI Generate Button & Loading State */}
          <div>
            {isGenerating ? (
              <div className="p-6 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <div className="text-sm font-bold text-cyan-300">{loadingStep}</div>
                <div className="text-xs text-slate-400">
                  Hệ thống AI đang khởi tạo câu hỏi trắc nghiệm khách quan 4 lựa chọn bám sát SGK...
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGenerateAI}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-cyan-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>✨ AI TẠO BỘ CÂU HỎI NGAY</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: PREVIEW & SELECT GAME TYPE */}
      {generatedQuestions && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Summary */}
          <div className="bg-[#0A1424] border border-cyan-500/40 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold">BƯỚC 2 / 2: DUYỆT CÂU HỎI & CHỌN TRÒ CHƠI</span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Đã tạo thành công {generatedQuestions.length} câu hỏi trắc nghiệm
              </h2>
              <p className="text-xs text-slate-400">
                Thầy/Cô có thể chỉnh sửa, sắp xếp, hoặc yêu cầu AI viết lại từng câu theo ý muốn.
              </p>
            </div>

            <button
              onClick={handlePublish}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>XUẤT BẢN & MỞ PHÒNG CHƠI</span>
              <span>➔</span>
            </button>
          </div>

          {/* Game Type Picker (8 Games) */}
          <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  CHỌN KIỂU TRÒ CHƠI PHÙ HỢP TIẾT HỌC
                </h3>
                <p className="text-xs text-slate-400">
                  Có 8 kiểu trò chơi tương tác giáo dục được thiết kế riêng cho trường THPT
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {GAME_MODES.map((mode) => {
                const isSelected = selectedGameType === mode.type;
                return (
                  <button
                    key={mode.type}
                    type="button"
                    onClick={() => {
                      setSelectedGameType(mode.type);
                      sounds.playSpinClick();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-cyan-950/70 to-indigo-950/70 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">{mode.icon}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <h4 className={`font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {mode.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {mode.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Questions List & Interactive Editor */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              Danh sách chi tiết các câu hỏi ({generatedQuestions.length})
            </h3>

            {generatedQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-[#0A1424] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-md"
              >
                {/* Question Header & Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono border border-cyan-700/50">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.difficulty}
                    </span>
                    {q.topic && (
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        • {q.topic}
                      </span>
                    )}
                  </div>

                  {/* Order & Management Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveQuestion(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
                      title="Chuyển lên"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveQuestion(idx, 'down')}
                      disabled={idx === generatedQuestions.length - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
                      title="Chuyển xuống"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

                    {/* AI Rewrite Actions */}
                    <button
                      type="button"
                      onClick={() => handleRewriteAI(q, 'harder')}
                      className="px-2 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 text-purple-300 text-[11px] font-medium flex items-center gap-1"
                      title="Tăng độ khó câu hỏi này"
                    >
                      <TrendingUp className="w-3 h-3 text-purple-400" />
                      <span className="hidden sm:inline">Tăng khó</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRewriteAI(q, 'easier')}
                      className="px-2 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-500/30 text-blue-300 text-[11px] font-medium flex items-center gap-1"
                      title="Giảm độ khó câu hỏi này"
                    >
                      <TrendingDown className="w-3 h-3 text-blue-400" />
                      <span className="hidden sm:inline">Giảm khó</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRewriteAI(q, 'similar')}
                      className="px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1"
                      title="Tạo một câu hỏi tương tự"
                    >
                      <Wand2 className="w-3 h-3 text-indigo-400" />
                      <span className="hidden sm:inline">Tương tự</span>
                    </button>

                    <div className="w-[1px] h-4 bg-slate-700 mx-1"></div>

                    <button
                      type="button"
                      onClick={() => handleDuplicateQuestion(q)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                      title="Nhân bản"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-500/30"
                      title="Xóa câu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Body */}
                <p className="text-sm sm:text-base font-semibold text-white mb-2 leading-relaxed">
                  {q.question}
                </p>

                {/* Code Snippet for Informatics */}
                {q.codeSnippet && (
                  <CodeBlock
                    code={q.codeSnippet}
                    language={q.codeLanguage || 'python'}
                  />
                )}

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {q.options.map((opt, oIdx) => {
                    const isRight = oIdx === q.correctAnswer;
                    const letters = ['A', 'B', 'C', 'D'];
                    return (
                      <div
                        key={oIdx}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                          isRight
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded font-bold flex items-center justify-center flex-shrink-0 text-[10px] ${
                          isRight ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {letters[oIdx]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isRight && <span className="text-[10px] text-emerald-400 font-bold">✓ Đúng</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-3 text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-slate-800/80">
                    💡 <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Publish Bar */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handlePublish}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base tracking-wide shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>XUẤT BẢN & BẮT ĐẦU TRÒ CHƠI</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
