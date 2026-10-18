export type Subject = 
  | 'Tin học'
  | 'Toán'
  | 'Ngữ văn'
  | 'Vật lí'
  | 'Hóa học'
  | 'Sinh học'
  | 'Lịch sử'
  | 'Địa lí'
  | 'Tiếng Anh'
  | 'Khác';

export type Grade = '10' | '11' | '12';

export type Difficulty = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export type GameType = 
  | 'racing'
  | 'wheel'
  | 'bomb'
  | 'puzzle'
  | 'space'
  | 'castle'
  | 'treasure'
  | 'arena';

export type GameMode = 
  | 'individual' 
  | 'team' 
  | 'live_class' 
  | 'self_study' 
  | 'homework';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  difficulty: Difficulty;
  topic?: string;
  codeSnippet?: string;
  codeLanguage?: 'python' | 'cpp' | 'html' | 'javascript' | 'sql';
}

export interface GameSettings {
  timePerQuestion: number; // seconds
  showExplanation: boolean;
  allowRetry: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  musicEnabled: boolean;
  soundEffects: boolean;
  mode: GameMode;
  homeworkDeadline?: string;
  maxAttempts?: number;
}

export interface Game {
  id: string;
  teacherId: string;
  title: string;
  subject: Subject;
  grade: Grade;
  textbook: string;
  lesson: string;
  gameType: GameType;
  questions: Question[];
  settings: GameSettings;
  createdAt: string;
  playCount: number;
  averageScore?: number;
}

export interface Participant {
  id: string;
  roomId: string;
  studentName: string;
  className: string;
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  wrongCount: number;
  totalTimeSeconds: number;
  joinedAt: string;
  answers: {
    questionId: string;
    chosenAnswer: number;
    isCorrect: boolean;
    responseTime: number;
    scoreAwarded: number;
  }[];
  finished: boolean;
}

export interface Room {
  id: string;
  gameId: string;
  roomCode: string; // e.g. "TIN012" or 6 digits
  status: 'waiting' | 'in_progress' | 'ended';
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  game: Game;
  participants: Participant[];
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  email: string;
  school: string;
  subject: Subject;
  role: 'teacher';
  avatar?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  schoolYear: string;
  studentCount: number;
  students: {
    id: string;
    fullName: string;
    studentCode: string;
    completedGames: number;
    avgScore: number;
  }[];
}

export interface AIAnalysisReport {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  commonMistakes: string[];
  difficultQuestions: {
    questionNumber: number;
    questionText: string;
    wrongRate: string;
    rootCause: string;
  }[];
  studentsNeedingSupport: {
    name: string;
    className: string;
    score: number;
    notes: string;
  }[];
  reviewRecommendations: string[];
  suggestedNextActivities: string[];
}
