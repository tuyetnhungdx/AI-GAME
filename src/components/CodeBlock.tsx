import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'python', title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'python': return 'Python 3';
      case 'cpp': return 'C++ 20';
      case 'html': return 'HTML5';
      case 'sql': return 'SQL (PostgreSQL)';
      case 'javascript': return 'JavaScript';
      default: return lang.toUpperCase();
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-cyan-500/30 bg-[#060D17] text-left shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0B1726] border-b border-cyan-500/20 text-xs text-cyan-300 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">{title || getLanguageLabel(language)}</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-800/80 transition-colors"
          title="Sao chép mã"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-cyan-950/20 transition-colors">
                <td className="pr-3 select-none text-slate-600 text-right w-6 font-mono text-[11px]">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre">
                  {highlightSyntax(line, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Lightweight client-side syntax highlighter for Python, SQL, C++, HTML
function highlightSyntax(line: string, lang: string): React.ReactNode {
  if (lang === 'python') {
    // Comments
    if (line.trim().startsWith('#')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }
  }

  // Tokens basic regex parser
  const parts = line.split(/(\b(?:def|class|return|import|from|in|for|while|if|elif|else|try|except|print|socket|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|AND|OR|NOT|int|float|void|include)\b|".*?"|'.*?'|\d+)/g);

  return parts.map((part, i) => {
    if (/^(def|class|return|import|from|in|for|while|if|elif|else|try|except|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|AND|OR|NOT|int|float|void|include)$/i.test(part)) {
      return <span key={i} className="text-purple-400 font-semibold">{part}</span>;
    }
    if (/^(print|socket|len|range|sorted|append)$/.test(part)) {
      return <span key={i} className="text-cyan-400 font-medium">{part}</span>;
    }
    if (/^(".*"|'.*')$/.test(part)) {
      return <span key={i} className="text-amber-300">{part}</span>;
    }
    if (/^\d+$/.test(part)) {
      return <span key={i} className="text-emerald-400">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}
