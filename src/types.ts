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
  | 'arena'
  | 'millionaire'
  | 'balloon';

export type GameMode = 
  | 'individual' 
  | 'team' 
  | 'live_class' 
  | 'self_study' 
  | 'homework';

export type GameEngineState = 
  | 'WAITING'
  | 'PLAYING'
  | 'ANSWERED'
  | 'NEXT_QUESTION'
  | 'FINISHED';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3
  explanation: string;
  difficulty: Difficulty;
  topic?: string;
  imageUrl?: string | null;
  codeSnippet?: string | null;
  codeLanguage?: 'python' | 'cpp' | 'html' | 'javascript' | 'sql' | string;
}

export interface GameSettings {
  timePerQuestion: number; // 10, 15, 20, 30, 45, 60
  showExplanation: boolean;
  showLeaderboard?: boolean;
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  speedBonus?: boolean;
  streakBonus?: boolean;
  allowRetry?: boolean;
  allowReplay?: boolean;
  autoNextQuestion?: boolean;
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  soundEffects?: boolean;
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

export interface ParticipantAnswer {
  participantId?: string;
  questionId: string;
  questionNumber?: number;
  questionText?: string;
  chosenAnswer: number;
  chosenAnswerText?: string;
  correctAnswer?: number;
  correctAnswerText?: string;
  isCorrect: boolean;
  responseTime: number; // seconds
  baseScore: number;
  speedBonus: number;
  streakBonus: number;
  scoreAwarded: number;
  totalScore?: number;
  createdAt?: string;
}

export type TeamId = 'red' | 'blue' | 'yellow' | 'purple';

export interface TeamInfo {
  id: TeamId;
  name: string;
  color: string;
  carEmoji: string;
  members: string[];
  totalScore: number;
}

export interface Participant {
  id: string;
  roomId: string;
  studentId?: string;
  studentCode?: string;
  studentName: string;
  className: string;
  teamId?: TeamId;
  score: number;
  streak: number;
  maxStreak: number;
  correctCount: number;
  wrongCount: number;
  totalTimeSeconds: number;
  joinedAt: string;
  completedAt?: string;
  rank?: number;
  answers: ParticipantAnswer[];
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

export type ScorePolicy = 'highest' | 'first' | 'latest' | 'average';
export type TimeFilterOption = 'all' | 'today' | 'week' | 'month' | 'semester1' | 'semester2' | 'custom';

export interface ClassStudentRow {
  stt: number;
  studentId: string;
  studentCode: string;
  fullName: string;
  className: string;
  participated: boolean;
  score10: number | null; // scale 0-10, e.g. 8.4
  rawScore: number | null; // e.g. 840
  correctCount: number | null;
  wrongCount: number | null;
  accuracyPercent: number | null; // e.g. 80 (%)
  totalTimeSeconds: number | null;
  rank: number | null;
  completedAt: string | null;
  status: 'Hoàn thành' | 'Chưa tham gia';
  attemptCount: number;
  answers: ParticipantAnswer[];
}

export interface ClassExportSummary {
  classInfo: ClassGroup;
  game: Game;
  roomCode: string;
  exportDate: string;
  teacherName: string;
  schoolName: string;
  totalStudents: number;
  participatedCount: number;
  absentCount: number;
  completionRatePercent: number; // e.g. 92.9%
  avgScore10: number; // e.g. 8.2
  avgAccuracyPercent: number; // e.g. 82%
  maxScore10: number;
  minScore10: number;
  students: ClassStudentRow[];
}

export interface QuestionAnalysisRow {
  index: number;
  questionText: string;
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  accuracyPercent: number;
  avgResponseTimeSeconds: number;
  difficulty: string;
  topic: string;
  evaluation: 'Nắm tốt' | 'Cơ bản đạt' | 'Cần củng cố' | 'Cần ôn lại';
}

export interface ExcelExportFilter {
  classId: string; // 'all' or class.name e.g. '12A1'
  gameId: string; // 'all' or game.id
  timeRange: TimeFilterOption;
  startDate?: string;
  endDate?: string;
  scorePolicy: ScorePolicy;
  sortBy: 'roster' | 'score';
  exportMode: 'full' | 'quick';
}
