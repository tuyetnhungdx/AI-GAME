import { useState, type FormEvent } from 'react';
import type { Difficulty, Question } from '../../types';

const difficulties: Difficulty[] = ['Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];

interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [error, setError] = useState('');
  const field = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white';
  const label = 'flex flex-col gap-1 text-sm text-slate-300';

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const read = (name: string) => String(fields.get(name) ?? '');
    const text = read('question').trim();
    const options = question.options.map((_, index) => read(`option-${index}`).trim());
    const correctAnswer = Number(read('correctAnswer'));

    if (!text || options.some(option => !option) || !options[correctAnswer]) {
      setError('Cô hãy nhập nội dung câu hỏi, điền đủ các phương án và chọn đáp án đúng.');
      return;
    }

    onSave({
      ...question,
      question: text,
      options,
      correctAnswer,
      difficulty: read('difficulty') as Difficulty,
      explanation: read('explanation').trim(),
      codeSnippet: read('code').trim() ? read('code') : null,
      codeLanguage: read('language').trim() || undefined,
    });
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <label className={label}>
        Nội dung câu hỏi
        <textarea name="question" defaultValue={question.question} rows={3} required autoFocus className={field} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, index) => (
          <label key={index} className={label}>
            Phương án {String.fromCharCode(65 + index)}
            <textarea name={`option-${index}`} defaultValue={option} rows={2} required className={field} />
          </label>
        ))}
        <label className={label}>
          Đáp án đúng
          <select name="correctAnswer" defaultValue={question.correctAnswer} required className={field}>
            {question.options.map((_, index) => (
              <option key={index} value={index}>{String.fromCharCode(65 + index)}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Mức độ
          <select name="difficulty" defaultValue={question.difficulty} className={field}>
            {difficulties.map(level => <option key={level}>{level}</option>)}
          </select>
        </label>
      </div>
      <label className={label}>
        Giải thích
        <textarea name="explanation" defaultValue={question.explanation} rows={2} className={field} />
      </label>
      <label className={label}>
        Đoạn mã (nếu có)
        <textarea name="code" defaultValue={question.codeSnippet ?? ''} rows={4} spellCheck={false} className={`${field} font-mono`} />
      </label>
      <label className={label}>
        Ngôn ngữ đoạn mã
        <input name="language" defaultValue={question.codeLanguage ?? ''} placeholder="Ví dụ: sql, python, html" className={field} />
      </label>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200">Hủy</button>
        <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950">Lưu câu hỏi</button>
      </div>
    </form>
  );
}
