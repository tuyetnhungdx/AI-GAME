import React, { useState } from 'react';
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  Bot, 
  Check, 
  Code2, 
  Copy, 
  Database, 
  Edit3, 
  FileText, 
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
import { TeacherQuestionImporter } from './TeacherQuestionImporter';

interface AIGeneratorViewProps {
  onPublishGame: (game: Game) => void;
  onSaveToQuestionBank?: (questions: Question[], metadata: any) => void;
  initialMode?: 'ai' | 'import';
}

export const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({
  onPublishGame,
  onSaveToQuestionBank,
  initialMode = 'ai',
}) => {
  // Top-level choice: 'ai' = AI TỰ ĐỘNG TẠO CÂU HỎI, 'import' = TÔI ĐÃ CÓ BỘ CÂU HỎI
  const [creationMode, setCreationMode] = useState<'ai' | 'import'>(initialMode);

  // Subject metadata
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
  const [count, setCount] = useState<number>(15);
  const [difficultyDistribution, setDifficultyDistribution] = useState('30% Nhận biết, 40% Thông hiểu, 30% Vận dụng');

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Questions Preview & Editor state
  const [activeQuestions, setActiveQuestions] = useState<Question[] | null>(null);

  // Game Type Selection (All 10 Games)
  const [selectedGameType, setSelectedGameType] = useState<GameType>('racing');

  const ALL_10_GAMES: { type: GameType; title: string; icon: string; desc: string }[] = [
    { type: 'racing', title: '1. Đường đua kiến thức', icon: '🏎️', desc: 'Đua xe tốc hành, câu đúng tăng tốc, kích hoạt Nitro theo chuỗi' },
    { type: 'wheel', title: '2. Vòng quay may mắn', icon: '🎡', desc: 'Quay vòng số nhân điểm, bốc thăm câu hỏi bất ngờ, X2, câu bí mật' },
    { type: 'bomb', title: '3. Gỡ bom kiến thức', icon: '💣', desc: 'Đếm ngược 20s kịch tính, chọn đúng dây ngòi nổ để vô hiệu hóa an toàn' },
    { type: 'puzzle', title: '4. Lật mảnh ghép', icon: '🧩', desc: 'Mỗi câu đúng lật 1 mảnh ghép hé lộ bức tranh công nghệ và đoán hình (+300đ)' },
    { type: 'space', title: '5. Chinh phục vũ trụ', icon: '🚀', desc: 'Phi thuyền không gian vượt qua các hành tinh tri thức tiến tới dải Ngân Hà' },
    { type: 'castle', title: '6. Vượt chướng ngại vật', icon: '🏰', desc: 'Vượt 6 ải: Cầu treo, Hố sâu, Cổng thành, Núi hiểm, Hang động, Lâu đài' },
    { type: 'treasure', title: '7. Săn kho báu', icon: '💎', desc: 'Thu thập chìa khóa vàng 🔑, mở rương báu nhận thưởng điểm thật' },
    { type: 'arena', title: '8. Đấu trường kiến thức', icon: '⚔️', desc: 'Kéo co năng lượng tri thức Đội Đỏ vs Đội Xanh không bạo lực' },
    { type: 'millionaire', title: '9. Ai là triệu phú', icon: '💰', desc: '15 mốc tiền thưởng, mốc an toàn và 3 quyền trợ giúp: 50:50, Đổi câu, Hỏi lớp' },
    { type: 'balloon', title: '10. Bắn bóng kiến thức', icon: '🎈', desc: '4 quả bóng bay nhẹ A, B, C, D – Chạm vào bóng để nổ bóng và ghi điểm' },
  ];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    sounds.playSpinClick();

    // 3-phase loading animation
    setLoadingStep('AI đang phân tích cấu trúc bài học và chuẩn kiến thức THPT...');
    await new Promise(r => setTimeout(r, 400));

    setLoadingStep('Đang khởi tạo các phương án nhiễu khoa học và code lập trình...');
    await new Promise(r => setTimeout(r, 400));

    setLoadingStep('Đang kiểm tra đáp án đúng và phân bổ mức độ nhận thức...');

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          grade,
          book: textbook,
          lesson: lessonTitle,
          content,
          questionCount: count,
          difficultyDistribution,
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // non-json response
      }

      if (res.status === 404) {
        throw new Error('Không tìm thấy API tạo câu hỏi');
      }

      if (!res.ok || !data?.success) {
        const errorText = data?.error || data?.message;
        if (res.status === 401 || res.status === 403 || errorText === 'Thiếu GEMINI_API_KEY') {
          throw new Error('API key Gemini chưa được cấu hình');
        }
        if (res.status === 429 || errorText?.toLowerCase().includes('quota') || errorText?.toLowerCase().includes('hạn mức')) {
          throw new Error('Đã hết hạn mức Gemini');
        }
        if (errorText === 'AI trả dữ liệu không hợp lệ') {
          throw new Error('AI trả dữ liệu không hợp lệ');
        }
        if (errorText) {
          throw new Error(errorText);
        }
        throw new Error('Không thể tạo câu hỏi lúc này');
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setActiveQuestions(data.questions);
        sounds.playFanfare();
      } else {
        throw new Error('AI trả dữ liệu không hợp lệ');
      }
    } catch (err: any) {
      console.error('Lỗi gọi API /api/generate-questions:', err);
      setErrorMsg(err.message || 'Không thể tạo câu hỏi lúc này. Vui lòng bấm thử lại.');
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
      if (data.success && data.question && activeQuestions) {
        setActiveQuestions(activeQuestions.map(item => item.id === q.id ? data.question : item));
        sounds.playCorrect();
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (!activeQuestions) return;
    setActiveQuestions(activeQuestions.filter(q => q.id !== id));
  };

  const handleDuplicateQuestion = (q: Question) => {
    if (!activeQuestions) return;
    const copy: Question = {
      ...q,
      id: `copy-${Date.now()}`,
      question: `[Bản sao] ${q.question}`,
    };
    setActiveQuestions([...activeQuestions, copy]);
  };

  const moveQuestion = (idx: number, direction: 'up' | 'down') => {
    if (!activeQuestions) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeQuestions.length) return;
    const newArr = [...activeQuestions];
    const [moved] = newArr.splice(idx, 1);
    newArr.splice(targetIdx, 0, moved);
    setActiveQuestions(newArr);
  };

  const handlePublish = () => {
    if (!activeQuestions || activeQuestions.length === 0) return;

    const gameModeInfo = ALL_10_GAMES.find(g => g.type === selectedGameType);
    const newGame: Game = {
      id: `game-${Date.now()}`,
      teacherId: 'teacher-tn-01',
      title: `${gameModeInfo?.title.split('.')[1]?.trim() || 'Trò chơi'} – ${subject} ${grade} – ${lessonTitle}`,
      subject,
      grade,
      textbook,
      lesson: lessonTitle,
      gameType: selectedGameType,
      questions: activeQuestions,
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>KHÔNG GIAN SOẠN BÀI CHO GIÁO VIÊN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            TẠO TRÒ CHƠI HỌC TẬP
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chọn AI sinh câu hỏi tự động hoặc đưa trực tiếp bộ câu hỏi có sẵn của Thầy/Cô vào game
          </p>
        </div>

        {activeQuestions && (
          <button
            onClick={() => setActiveQuestions(null)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold border border-slate-700 self-start md:self-auto flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Soạn lại từ đầu</span>
          </button>
        )}
      </div>

      {/* When NO questions are active yet, show the 2 Primary Choices: AI vs Teacher Own Questions */}
      {!activeQuestions && creationMode === 'import' && (
        <TeacherQuestionImporter
          subject={subject}
          grade={grade}
          textbook={textbook}
          lessonTitle={lessonTitle}
          onProceedToGameSelection={(questions) => {
            setActiveQuestions(questions);
            sounds.playFanfare();
          }}
          onSaveToQuestionBank={onSaveToQuestionBank}
          onSwitchToAI={() => setCreationMode('ai')}
        />
      )}

      {!activeQuestions && creationMode === 'ai' && (
        <div className="space-y-6">
          {/* Two Big Choice Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Choice 1: AI (ACTIVE) */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/50 via-[#0B1526] to-[#0A1424] border-2 border-cyan-500/60 shadow-xl flex items-start gap-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/30 flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  <span>LỰA CHỌN 1 (ĐANG CHỌN)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  1. AI TỰ ĐỘNG TẠO CÂU HỎI
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Dán nội dung SGK, Gemini AI tự động sinh câu hỏi trắc nghiệm kèm code lập trình chuẩn THPT.
                </p>
              </div>
            </div>

            {/* Choice 2: Teacher Has Own Question Set */}
            <div
              onClick={() => { setCreationMode('import'); sounds.playSpinClick(); }}
              className="p-6 rounded-3xl bg-[#0A1424] border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">
                  LỰA CHỌN 2
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-purple-300 transition-colors">
                  2. TÔI ĐÃ CÓ BỘ CÂU HỎI
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Đưa bộ đề có sẵn của Thầy/Cô vào web: Nhập tay, dán nhiều câu, hoặc tải file Word, Excel, PDF.
                </p>
              </div>
            </div>
          </div>

          {/* AI Generator Form Card */}
          <div className="bg-[#0A1424] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  MÔN HỌC
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  KHỐI LỚP
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="w-full bg-[#060D17] border border-slate-700 focus:border-cyan-400 text-white px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                >
                  <option value="12">Lớp 12 (Thi TN THPT & Hướng nghiệp)</option>
                  <option value="11">Lớp 11 (Python & Cấu trúc dữ liệu)</option>
                  <option value="10">Lớp 10 (Kiến thức cơ bản)</option>
                </select>
              </div>

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

            {/* Question count and difficulty */}
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
                    Khởi động / Củng cố nhanh (50% NB, 50% TH)
                  </option>
                  <option value="30% Thông hiểu, 40% Vận dụng, 30% Vận dụng cao">
                    Đấu trường nâng cao (30% TH, 40% VD, 30% VDC)
                  </option>
                </select>
              </div>
            </div>

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
        </div>
      )}

      {/* When Questions ARE Available (Either from AI or Teacher Import) */}
      {activeQuestions && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header Summary */}
          <div className="bg-[#0A1424] border border-cyan-500/40 rounded-3xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                BỘ CÂU HỎI SẴN SÀNG ({activeQuestions.length} CÂU)
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                Chọn kiểu trò chơi để tạo phòng học ngay
              </h2>
              <p className="text-xs text-slate-400">
                Thầy/Cô có thể dùng bộ câu hỏi này cho bất kỳ game nào trong 10 kiểu trò chơi dưới đây.
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

          {/* 10 Game Modes Selection Grid */}
          <div className="bg-[#07111E] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-cyan-400" />
                  CHỌN 1 TRONG 10 KIỂU TRÒ CHƠI GIÁO DỤC
                </h3>
                <p className="text-xs text-slate-400">
                  Mỗi trò chơi có luật chơi và cơ chế tính điểm riêng biệt, tương tác thật 100%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ALL_10_GAMES.map((mode) => {
                const isSelected = selectedGameType === mode.type;
                return (
                  <button
                    key={mode.type}
                    type="button"
                    onClick={() => {
                      setSelectedGameType(mode.type);
                      sounds.playSpinClick();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
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
                      <h4 className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {mode.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {mode.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question List Preview */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              Chi tiết từng câu hỏi trong bộ đề ({activeQuestions.length})
            </h3>

            {activeQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-[#0A1424] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono border border-cyan-700/50">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.difficulty}
                    </span>
                  </div>

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
                      disabled={idx === activeQuestions.length - 1}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30"
                      title="Chuyển xuống"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
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

                <p className="text-sm sm:text-base font-semibold text-white mb-2 leading-relaxed">
                  {q.question}
                </p>

                {q.codeSnippet && (
                  <CodeBlock code={q.codeSnippet} language={q.codeLanguage || 'python'} />
                )}

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
                        <span
                          className={`w-5 h-5 rounded font-bold flex items-center justify-center flex-shrink-0 text-[10px] ${
                            isRight ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {letters[oIdx]}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isRight && <span className="text-[10px] text-emerald-400 font-bold">✓ Đúng</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-3 text-[11px] text-slate-400 bg-black/20 p-2.5 rounded-xl border border-slate-800/80">
                    💡 <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={handlePublish}
              className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
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
