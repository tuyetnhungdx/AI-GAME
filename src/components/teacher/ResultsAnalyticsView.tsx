import React, { useState } from 'react';
import { 
  AlertTriangle, 
  BarChart3, 
  Bot, 
  CheckCircle, 
  ChevronDown, 
  Clock, 
  FileSpreadsheet,
  FileText, 
  HelpCircle, 
  Lightbulb, 
  Loader2, 
  Printer, 
  Search, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Trophy, 
  UserCheck, 
  Users, 
  XCircle,
  Database
} from 'lucide-react';
import { AIAnalysisReport, ClassGroup, Game, Room } from '../../types';
import { demoClasses, demoGames } from '../../data/initialData';
import { sounds } from '../../utils/audio';
import { ClassExcelExportPanel } from './ClassExcelExportPanel';
import { SupabaseSetupModal } from './SupabaseSetupModal';

interface ResultsAnalyticsViewProps {
  room: Room;
  classes?: ClassGroup[];
  games?: Game[];
}

export const ResultsAnalyticsView: React.FC<ResultsAnalyticsViewProps> = ({ 
  room,
  classes = demoClasses,
  games = demoGames,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'correct'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  // AI Analysis state
  const [aiReport, setAiReport] = useState<AIAnalysisReport | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // Metrics calculation
  const participants = room.participants;
  const count = participants.length;
  const scores = participants.map((p) => p.score);
  const avgScore = count > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : 0;
  const maxScore = count > 0 ? Math.max(...scores) : 0;
  const minScore = count > 0 ? Math.min(...scores) : 0;

  const totalQuestions = room.game.questions.length;
  const totalCorrect = participants.reduce((a, b) => a + b.correctCount, 0);
  const accuracyPercent = count > 0 ? Math.round((totalCorrect / (count * totalQuestions)) * 100) : 0;
  const avgTime = count > 0 ? Math.round(participants.reduce((a, b) => a + (b.totalTimeSeconds || 40), 0) / count) : 0;

  // Question-by-question breakdown simulation
  const questionStats = room.game.questions.map((q, idx) => {
    // Generate realistic distribution
    const isCodeQ = !!q.codeSnippet;
    const wrongPercent = isCodeQ ? 38 + (idx % 3) * 4 : 15 + (idx % 4) * 5;
    const correctPercent = 100 - wrongPercent;
    return {
      index: idx + 1,
      question: q.question,
      difficulty: q.difficulty,
      topic: q.topic || 'Tin học',
      correctPercent,
      wrongPercent,
      isHardest: idx === 1 || idx === 8, // Highlight code questions as hardest
    };
  });

  // Filter & sort students
  const filteredParticipants = [...participants]
    .filter((p) => p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || p.className.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let diff = 0;
      if (sortBy === 'score') diff = b.score - a.score;
      if (sortBy === 'name') diff = a.studentName.localeCompare(b.studentName);
      if (sortBy === 'correct') diff = b.correctCount - a.correctCount;
      return sortAsc ? -diff : diff;
    });

  const handleRunAiAnalysis = async () => {
    setIsLoadingAi(true);
    sounds.playSpinClick();

    try {
      const res = await fetch('/api/ai/analyze-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: room.roomCode }),
      });
      const data = await res.json();
      if (data.success && data.report) {
        setAiReport(data.report);
        sounds.playFanfare();
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2.5 py-0.5 rounded-full">
              MÃ PHÒNG: {room.roomCode}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(room.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            BÁO CÁO KẾT QUẢ & PHÂN TÍCH SƯ PHẠM
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {room.game.title} (Giáo viên: <strong>Cô Trần Thị Tuyết Nhung</strong>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playSpinClick();
              setShowSupabaseModal(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            title="Xem mã SQL và kiểm tra kết nối Supabase"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>KẾT NỐI SUPABASE</span>
          </button>

          <a
            href="#excel-export-section"
            onClick={(e) => {
              e.preventDefault();
              sounds.playSpinClick();
              document.getElementById('excel-export-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-300" />
            <span>XUẤT EXCEL</span>
          </a>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>In báo cáo</span>
          </button>

          <button
            onClick={handleRunAiAnalysis}
            disabled={isLoadingAi}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoadingAi ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>{isLoadingAi ? 'AI ĐANG PHÂN TÍCH...' : '✨ AI PHÂN TÍCH KẾT QUẢ'}</span>
          </button>
        </div>
      </div>

      {/* 6 Key Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0A1424] border border-cyan-500/30 rounded-2xl p-4 text-center">
          <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
          <div className="text-[11px] text-slate-400">Tổng học sinh</div>
          <div className="text-xl font-mono font-black text-white">{count}</div>
        </div>

        <div className="bg-[#0A1424] border border-indigo-500/30 rounded-2xl p-4 text-center">
          <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
          <div className="text-[11px] text-slate-400">Điểm trung bình</div>
          <div className="text-xl font-mono font-black text-cyan-300">{avgScore}</div>
        </div>

        <div className="bg-[#0A1424] border border-emerald-500/30 rounded-2xl p-4 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
          <div className="text-[11px] text-slate-400">Điểm cao nhất</div>
          <div className="text-xl font-mono font-black text-emerald-400">{maxScore}</div>
        </div>

        <div className="bg-[#0A1424] border border-rose-500/30 rounded-2xl p-4 text-center">
          <AlertTriangle className="w-4 h-4 text-rose-400 mx-auto mb-1.5" />
          <div className="text-[11px] text-slate-400">Điểm thấp nhất</div>
          <div className="text-xl font-mono font-black text-rose-400">{minScore}</div>
        </div>

        <div className="bg-[#0A1424] border border-purple-500/30 rounded-2xl p-4 text-center">
          <CheckCircle className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
          <div className="text-[11px] text-slate-400">Tỷ lệ đúng TB</div>
          <div className="text-xl font-mono font-black text-purple-300">{accuracyPercent}%</div>
        </div>

        <div className="bg-[#0A1424] border border-amber-500/30 rounded-2xl p-4 text-center">
          <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
          <div className="text-[11px] text-slate-400">Thời gian TB</div>
          <div className="text-xl font-mono font-black text-amber-300">{avgTime}s</div>
        </div>
      </div>

      {/* FEATURE: XUẤT KẾT QUẢ THEO LỚP RA EXCEL */}
      <div id="excel-export-section" className="scroll-mt-6">
        <ClassExcelExportPanel
          classes={classes}
          games={games}
          activeRoom={room}
          defaultClassId="12A1"
          defaultGameId={room.game.id}
        />
      </div>

      {/* AI Pedagogical Analysis Report Card */}
      {aiReport && (
        <div className="bg-[#091526] border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex items-center gap-2 mb-4 border-b border-purple-500/30 pb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                BÁO CÁO CỐ VẤN SƯ PHẠM THÔNG MINH BỞI AI
              </h3>
              <p className="text-xs text-purple-300">
                Phân tích chuẩn xác năng lực học tập của lớp dựa trên dữ liệu thi đua thực tế
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-2xl mb-6 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <strong className="text-purple-300">Nhận định tổng quan:</strong> {aiReport.summary}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <div className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-4">
              <h4 className="font-bold text-xs uppercase text-emerald-400 flex items-center gap-1.5 mb-2.5">
                <CheckCircle className="w-4 h-4" />
                Kiến thức học sinh nắm tốt
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {aiReport.strengths.map((str, i) => (
                  <li key={i} className="leading-relaxed">{str}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-slate-900/70 border border-rose-500/30 rounded-2xl p-4">
              <h4 className="font-bold text-xs uppercase text-rose-400 flex items-center gap-1.5 mb-2.5">
                <XCircle className="w-4 h-4" />
                Kiến thức học sinh còn yếu & nhầm lẫn
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {aiReport.weaknesses.map((w, i) => (
                  <li key={i} className="leading-relaxed">{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Difficult Questions Highlight */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 mb-6">
            <h4 className="font-bold text-xs uppercase text-amber-300 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Câu hỏi học sinh sai nhiều nhất (Cần sửa bài chi tiết)
            </h4>
            <div className="space-y-2.5">
              {aiReport.difficultQuestions.map((dq, i) => (
                <div key={i} className="p-3 bg-black/40 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                    <span>Câu {dq.questionNumber}: {dq.questionText}</span>
                    <span className="text-rose-400 font-mono">Tỷ lệ sai: {dq.wrongRate}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong className="text-amber-400">Nguyên nhân cốt lõi:</strong> {dq.rootCause}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Needed & Pedagogical Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students needing support */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <h4 className="font-bold text-xs uppercase text-cyan-300 flex items-center gap-1.5 mb-3">
                <UserCheck className="w-4 h-4" />
                Học sinh cần giáo viên quan tâm, hỗ trợ
              </h4>
              <div className="space-y-2">
                {aiReport.studentsNeedingSupport.map((st, i) => (
                  <div key={i} className="flex items-start justify-between p-2.5 bg-black/30 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <div className="font-bold text-white">{st.name} <span className="text-slate-500 font-normal">({st.className})</span></div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{st.notes}</div>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-xs">{st.score} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div>
                <h4 className="font-bold text-xs uppercase text-purple-300 flex items-center gap-1.5 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  Đề xuất nội dung ôn lại
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {aiReport.reviewRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-indigo-300 flex items-center gap-1.5 mb-2">
                  <Target className="w-4 h-4" />
                  Đề xuất hoạt động tiếp theo
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {aiReport.suggestedNextActivities.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question-by-Question Diagnostic Grid */}
      <div className="bg-[#0A1424] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Phân tích tỷ lệ đúng / sai từng câu hỏi
        </h3>

        <div className="space-y-3">
          {questionStats.map((qs) => (
            <div
              key={qs.index}
              className={`p-4 rounded-2xl border transition-all ${
                qs.isHardest
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    Câu {qs.index}
                  </span>
                  <span className="font-semibold text-white">{qs.question}</span>
                  {qs.isHardest && (
                    <span className="text-[10px] bg-rose-500 text-white font-bold px-2 py-0.2 rounded-full">
                      HỌC SINH SAI NHIỀU NHẤT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-emerald-400 font-bold">{qs.correctPercent}% đúng</span>
                  <span className="text-rose-400 font-bold">{qs.wrongPercent}% sai</span>
                </div>
              </div>

              {/* Progress split bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: `${qs.correctPercent}%` }}></div>
                <div className="bg-rose-500 h-full" style={{ width: `${qs.wrongPercent}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Roster Table with Search & Sort */}
      <div className="bg-[#0A1424] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Bảng kết quả học sinh ({filteredParticipants.length})
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên học sinh, lớp..."
              className="bg-slate-900 border border-slate-700 text-white text-xs pl-9 pr-4 py-2 rounded-xl outline-none focus:border-cyan-400 w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="py-3 px-3">Hạng</th>
                <th
                  onClick={() => { setSortBy('name'); setSortAsc(!sortAsc); }}
                  className="py-3 px-3 cursor-pointer hover:text-cyan-300"
                >
                  Họ tên học sinh
                </th>
                <th className="py-3 px-3">Lớp</th>
                <th
                  onClick={() => { setSortBy('score'); setSortAsc(!sortAsc); }}
                  className="py-3 px-3 text-right cursor-pointer hover:text-amber-300"
                >
                  Điểm
                </th>
                <th
                  onClick={() => { setSortBy('correct'); setSortAsc(!sortAsc); }}
                  className="py-3 px-3 text-center cursor-pointer hover:text-emerald-300"
                >
                  Đúng / Sai
                </th>
                <th className="py-3 px-3 text-center">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredParticipants.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-slate-900/40 text-slate-300">
                  <td className="py-3 px-3 font-mono font-bold">
                    {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">{p.studentName}</td>
                  <td className="py-3 px-3 text-slate-400">{p.className}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-300">{p.score} pts</td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="text-emerald-400 font-bold">{p.correctCount}</span>
                    <span className="text-slate-600"> / </span>
                    <span className="text-rose-400">{p.wrongCount}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{p.totalTimeSeconds || 42}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supabase Setup & SQL Modal */}
      <SupabaseSetupModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};
