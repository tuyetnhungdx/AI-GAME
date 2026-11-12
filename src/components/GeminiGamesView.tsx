import { useEffect, useState, type FormEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { geminiGames, type GeminiGame } from '../data/geminiGames';

export function GeminiGamesView() {
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('');
  const [sharedGames, setSharedGames] = useState<GeminiGame[]>([]);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadGames() {
      try {
        const response = await fetch('/api/gemini-games', { signal: controller.signal });
        if (!response.ok) throw new Error();
        const { games } = await response.json() as { games: GeminiGame[] };
        if (!controller.signal.aborted) setSharedGames((previous) => [...games, ...previous]);
      } catch {
        if (!controller.signal.aborted) setLoadError('Chưa tải được các link đã thêm trên website.');
      }
    }
    void loadGames();
    return () => controller.abort();
  }, []);

  const allGames = [...new Map([...geminiGames, ...sharedGames].map((game) => [game.url, game])).values()];
  const search = query.trim().toLocaleLowerCase('vi');
  const games = allGames.filter((game) =>
    (!grade || game.grade === grade) &&
    [game.title, game.lesson].some((text) => text.toLocaleLowerCase('vi').includes(search))
  );

  async function addGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const url = new URL(String(fields.get('url')).trim()).href;
      if (allGames.some((game) => game.url === url)) throw new Error('Link này đã có trong danh sách.');
      const response = await fetch('/api/gemini-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${String(fields.get('adminKey')).trim()}`,
        },
        body: JSON.stringify({
          title: fields.get('title'),
          lesson: fields.get('lesson'),
          grade: fields.get('grade'),
          url,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Chưa lưu được link.');
      setSharedGames((previous) => [...previous, result.game]);
      setQuery('');
      setGrade('');
      setShowForm(false);
      setNotice('Đã thêm game vào danh sách.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Chưa lưu được link.');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = 'rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100';

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-slate-100">Game Gemini</h1>
        <button
          type="button"
          aria-expanded={showForm}
          aria-controls="add-gemini-game"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setNotice('');
          }}
          disabled={saving}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
        >
          {showForm ? 'Đóng' : '+ Thêm link'}
        </button>
      </div>

      {loadError && <p className="mt-3 text-sm text-amber-300" role="status">{loadError}</p>}
      {notice && <p className="mt-3 text-sm text-cyan-300" role="status">{notice}</p>}

      {showForm && (
        <form id="add-gemini-game" onSubmit={addGame} className="mt-5 space-y-4 rounded-2xl border border-cyan-500/25 p-4">
          <fieldset disabled={saving} className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tên trò chơi
              <input name="title" required maxLength={120} className={inputStyle} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Tên bài học
              <input name="lesson" required maxLength={100} className={inputStyle} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Khối lớp
              <select name="grade" defaultValue="" required className={inputStyle}>
                <option value="" disabled>Chọn khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Link chia sẻ game
              <input name="url" type="url" placeholder="https://" required maxLength={2048} className={inputStyle} />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Mã quản lý của giáo viên
              <input name="adminKey" type="password" required className={inputStyle} />
            </label>
          </fieldset>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button type="submit" disabled={saving} className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50">
            {saving ? 'Đang lưu…' : 'Lưu link'}
          </button>
        </form>
      )}

      {allGames.length > 0 && (
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
          {allGames.length === 0 ? 'Chưa có trò chơi được thêm.' : 'Không tìm thấy trò chơi phù hợp.'}
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
