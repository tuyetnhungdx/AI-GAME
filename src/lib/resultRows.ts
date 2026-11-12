export interface SavedResult {
  id: string;
  game_id: string | null;
  room_code: string;
  class_name: string;
  student_name: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  total_time_seconds: number;
  rank: number;
  completed_at: string;
}

export const resultColumns = 'id,game_id,room_code,class_name,student_name,score,correct_count,wrong_count,total_time_seconds,rank,completed_at';

export function groupResultRows(rows: SavedResult[]) {
  const latestByKey = new Map<string, { row: SavedResult; ids: string[] }>();
  const groups: { row: SavedResult; ids: string[] }[] = [];
  for (const row of rows) {
    const key = JSON.stringify([
      row.game_id, row.room_code, row.class_name.trim().toLowerCase(),
      row.student_name.trim().toLowerCase(), row.score, row.correct_count,
      row.wrong_count, row.total_time_seconds,
    ]);
    const previous = latestByKey.get(key);
    // The old client wrote the same completion twice, through the API and then directly.
    if (previous && previous.ids.length === 1 &&
      Math.abs(Date.parse(row.completed_at) - Date.parse(previous.row.completed_at)) <= 8000) {
      previous.ids.push(row.id);
      continue;
    }
    const group = { row, ids: [row.id] };
    groups.push(group);
    latestByKey.set(key, group);
  }
  return groups;
}
