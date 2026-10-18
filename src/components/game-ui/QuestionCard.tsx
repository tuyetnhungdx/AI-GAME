import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { Question } from '../../types';
import { CodeBlock } from '../CodeBlock';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
}) => {
  return (
    <div className="bg-[#0B1728] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl relative transition-all">
      {/* Top Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs bg-cyan-950 text-cyan-300 border border-cyan-700/50 px-2.5 py-0.5 rounded-full">
            Câu {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {question.difficulty}
          </span>
        </div>

        {question.topic && (
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chủ đề: <strong className="text-slate-200">{question.topic}</strong></span>
          </span>
        )}
      </div>

      {/* Main Question Text */}
      <h2 className="text-lg sm:text-2xl font-bold text-white leading-relaxed text-left">
        {question.question}
      </h2>

      {/* Optional Image */}
      {question.imageUrl && (
        <div className="my-4 rounded-2xl overflow-hidden border border-slate-700 max-h-60 flex justify-center bg-black/40">
          <img
            src={question.imageUrl}
            alt="Hình minh họa câu hỏi"
            className="object-contain max-h-60"
          />
        </div>
      )}

      {/* Informatics Code Snippet */}
      {question.codeSnippet && (
        <CodeBlock
          code={question.codeSnippet}
          language={question.codeLanguage || 'python'}
        />
      )}
    </div>
  );
};
