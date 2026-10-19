import type { Game } from '../types';

const STORAGE_KEY = 'ai-game:games:v1';

export function loadGames(defaults: Game[]): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;

    const saved = JSON.parse(raw);

    if (
      !Array.isArray(saved) ||
      !saved.every(game =>
        game &&
        typeof game.id === 'string' &&
        typeof game.title === 'string' &&
        Array.isArray(game.questions) &&
        game.settings
      )
    ) {
      return defaults;
    }

    const ids = new Set(saved.map(game => game.id));

    return [
      ...saved,
      ...defaults.filter(game => !ids.has(game.id)),
    ];
  } catch {
    return defaults;
  }
}

export function saveGames(games: Game[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}
