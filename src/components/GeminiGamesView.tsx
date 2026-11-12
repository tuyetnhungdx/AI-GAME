import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { geminiGames } from '../data/geminiGames';

export function GeminiGamesView() {
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('');
  const search = query.trim().toLocaleLowerCase('vi');
  const games = geminiGames.filter((game) =>
    (!grade || game.grade === grade) &&
    [game.title, game.lesson].some((text) => text.toLocaleLowerCase('vi').includes(search))
  );

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold text-slate-100">Game Gemini</h1>

      {geminiGames.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-300">
            Tìm theo tên game hoặc bài học
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-slate-300">
            Khối lớp
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
            >
              <option value="">Tất cả khối</option>
              <option value="10">Khối 10</option>
              <option value="11">Khối 11</option>
              <option value="12">Khối 12</option>
            </select>
          </label>
        </div>
      )}

      {games.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-300" role="status">
          {geminiGames.length === 0 ? 'Chưa có trò chơi được thêm.' : 'Không tìm thấy trò chơi phù hợp.'}
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <li key={game.url} className="flex flex-col items-start gap-3 rounded-2xl border border-cyan-500/25 bg-slate-900 p-5">
              <p className="text-sm font-medium text-cyan-300">Khối {game.grade}</p>
              <h2 className="text-lg font-bold">{game.title}</h2>
              <p className="text-sm text-slate-300">{game.lesson}</p>
              <a
                href={game.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chơi ngay: ${game.title} (mở tab mới)`}
                className="mt-auto inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
              >
                Chơi ngay <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
