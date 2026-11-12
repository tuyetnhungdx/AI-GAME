export interface GeminiGame {
  title: string;
  grade: '10' | '11' | '12';
  lesson: string;
  url: `https://${string}`;
}

// Thêm các trò chơi đã có liên kết chia sẻ vào danh sách này.
export const geminiGames: GeminiGame[] = [
  {
    title: 'Ôn tập Bài 10 – Tin học 11',
    grade: '11',
    lesson: 'Bài 10',
    url: 'https://share.gemini.google/xGO5qr0G0AMe',
  },
];
