import { loadGames, saveGames } from './lib/gameStorage';import React, { useEffect, useState } from 'react';
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { GamePlayScreen } from './components/student/GamePlayScreen';
import { LeaderboardPodium } from './components/student/LeaderboardPodium';
import { StudentJoin } from './components/student/StudentJoin';
import { StudentLobby } from './components/student/StudentLobby';
import { AIGeneratorView } from './components/teacher/AIGeneratorView';
import { LiveRoomHostView } from './components/teacher/LiveRoomHostView';
import { ResultsAnalyticsView } from './components/teacher/ResultsAnalyticsView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { 
  demoClasses, 
  demoGames, 
  demoRoomTIN012, 
  initialTeacher 
} from './data/initialData';
import { ClassGroup, Game, Participant, ParticipantAnswer, Room, TeacherProfile } from './types';
import { sounds } from './utils/audio';
import { saveGameResultToSupabase } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [teacher] = useState<TeacherProfile>(initialTeacher);
  const [games, setGames] = useState<Game[]>(
  () => loadGames(demoGames)
);
  const [classes, setClasses] = useState<ClassGroup[]>(() => {
  try {
    const raw = localStorage.getItem('ai-game:classes:v1');
    if (!raw) return demoClasses;

    const saved = JSON.parse(raw);

    if (
      Array.isArray(saved) &&
      saved.every(c =>
        c &&
        typeof c.id === 'string' &&
        typeof c.name === 'string' &&
        typeof c.schoolYear === 'string' &&
        typeof c.studentCount === 'number' &&
        Array.isArray(c.students)
      )
    ) {
      return saved;
    }

    return demoClasses;
  } catch {
    return demoClasses;
  }
});useEffect(() => {
  const syncClassesWithServer = async () => {
    try {
      // Đẩy các lớp đang có trên máy GV lên Supabase
      await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classes }),
      });

      // Sau đó đọc dữ liệu chuẩn từ Supabase
      const res = await fetch('/api/classes');

      if (!res.ok) return;

      const data = await res.json();

      if (
        data.success &&
        Array.isArray(data.classes) &&
        data.classes.length > 0
      ) {
        setClasses(data.classes);

        localStorage.setItem(
          'ai-game:classes:v1',
          JSON.stringify(data.classes)
        );
      }
    } catch (error) {
      console.error(
        'Không đồng bộ được lớp với Supabase:',
        error
      );
    }
  };

  syncClassesWithServer();
}, []);

const handleClassesChange = (next: ClassGroup[]): boolean => {
  try {
    localStorage.setItem('ai-game:classes:v1', JSON.stringify(next));
    setClasses(next);
    return true;
  } catch {
    window.alert(
      'Không lưu được danh sách lớp. Bộ nhớ trình duyệt đã đầy hoặc bị chặn.'
    );
    return false;
  }
};

  // Active room state
  const [activeRoom, setActiveRoom] = useState<Room>(demoRoomTIN012);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  // Final gameplay result for podium
  const [finalGameStats, setFinalGameStats] = useState<{
    score: number;
    correctCount: number;
    wrongCount: number;
  }>({ score: 840, correctCount: 8, wrongCount: 2 });

  // Check URL query parameters for ?room=CODE
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      setActiveTab('student-join');
    }
  }, []);

  // Action: Join room from Student Join form
  const handleJoinRoom = async (
    roomCode: string,
    studentName: string,
    className: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(roomCode)}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, className }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
  setActiveRoom(data.room);
  setCurrentParticipant(data.participant);

      // Không thêm trùng học sinh cùng tên trong cùng một lớp
      const studentExists = cls.students.some(
        student =>
          student.fullName.trim().toLowerCase() ===
          studentName.trim().toLowerCase()
      );

      if (studentExists) {
        return cls;
      }

      const newStudent = {
        id: data.participant.id,
        fullName: studentName.trim(),
        studentCode: `HS-${data.participant.id.slice(0, 8)}`,
        completedGames: 0,
        avgScore: 0,
      };

      const updatedStudents = [
        ...cls.students,
        newStudent
      ];

      return {
        ...cls,
        students: updatedStudents,
        studentCount: updatedStudents.length,
      };
    })
  );

  setActiveTab('student-lobby');
  sounds.playSpinClick();
  return true;
}
      }
    } catch {
      // Local fallback
    }

    // Local fallback check
    if (roomCode === 'TIN012' || activeRoom?.roomCode === roomCode) {
      const fallbackRoom = activeRoom || demoRoomTIN012;
      const newParticipant: Participant = {
        id: `p-local-${Date.now()}`,
        roomId: fallbackRoom.id,
        studentName,
        className,
        score: 0,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        wrongCount: 0,
        totalTimeSeconds: 0,
        joinedAt: new Date().toISOString(),
        answers: [],
        finished: false,
      };

      const updatedRoom = {
        ...fallbackRoom,
        participants: [...fallbackRoom.participants, newParticipant],
      };
      setActiveRoom(updatedRoom);
      setCurrentParticipant(newParticipant);
      setActiveTab('student-lobby');
      sounds.playSpinClick();
      return true;
    }

    return false;
  };

  // Action: Teacher creates and publishes a game
  const handlePublishGame = async (newGame: Game) => {
  const updatedGames = [
    newGame,
    ...games.filter(game => game.id !== newGame.id),
  ];

  try {
    saveGames(updatedGames);
  } catch {
    window.alert(
      'Chưa lưu được trò chơi. Bộ nhớ trình duyệt đã đầy hoặc bị chặn. Hãy giữ trang này và kiểm tra quyền lưu trữ rồi thử lại.'
    );
    return;
  }

  setGames(updatedGames);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: newGame }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
  setActiveRoom(data.room);
  setCurrentParticipant(data.participant);

  setActiveTab('student-lobby');
  sounds.playSpinClick();
  return true;
}
      }
    } catch {
      // ignore
    }

    // Local room creation fallback
    window.alert(
  'Chưa tạo được phòng online. Hãy kiểm tra API và cấu hình Supabase trên Vercel.'
);
return;
    const localRoom: Room = {
      id: `room-${Date.now()}`,
      gameId: newGame.id,
      roomCode: Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'waiting',
      createdAt: new Date().toISOString(),
      game: newGame,
      participants: [
        {
          id: 'p-sim-1',
          roomId: `room-${Date.now()}`,
          studentName: 'Nguyễn Văn An',
          className: '12A1',
          score: 0,
          streak: 0,
          maxStreak: 0,
          correctCount: 0,
          wrongCount: 0,
          totalTimeSeconds: 0,
          joinedAt: new Date().toISOString(),
          answers: [],
          finished: false,
        },
        {
          id: 'p-sim-2',
          roomId: `room-${Date.now()}`,
          studentName: 'Trần Thu Hà',
          className: '12A1',
          score: 0,
          streak: 0,
          maxStreak: 0,
          correctCount: 0,
          wrongCount: 0,
          totalTimeSeconds: 0,
          joinedAt: new Date().toISOString(),
          answers: [],
          finished: false,
        },
      ],
    };
    setActiveRoom(localRoom);
    setActiveTab('teacher-host');
  };

  // Action: Teacher selects an existing game to host
  const handleSelectGameToHost = async (game: Game) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.room) {
          setActiveRoom(data.room);
          setActiveTab('teacher-host');
          sounds.playSpinClick();
          return;
        }
      }
    } catch {
      // Local fallback
    }

   window.alert(
  'Chưa mở được phòng online. Hãy kiểm tra API và cấu hình Supabase trên Vercel.'
);
return;

const hostRoom: Room = {
  id: `room-${Date.now()}`,
      gameId: game.id,
      roomCode: game.id === demoGames[0].id ? 'TIN012' : Math.floor(100000 + Math.random() * 900000).toString(),
      status: 'waiting',
      createdAt: new Date().toISOString(),
      game,
      participants: demoRoomTIN012.participants,
    };
    setActiveRoom(hostRoom);
    setActiveTab('teacher-host');
    sounds.playSpinClick();
  };

  // Action: Start game
  const handleStartGame = async () => {
    sounds.playFanfare();
    if (activeRoom) {
      try {
        await fetch(`/api/rooms/${encodeURIComponent(activeRoom.roomCode)}/start`, { method: 'POST' });
      } catch {
        // ignore
      }
      activeRoom.status = 'in_progress';
    }

    // If current user is not set as participant, create default demo student
    if (!currentParticipant) {
      const p: Participant = {
        id: `p-${Date.now()}`,
        roomId: activeRoom.id,
        studentName: 'Học sinh Trải nghiệm',
        className: '12A1',
        score: 0,
        streak: 0,
        maxStreak: 0,
        correctCount: 0,
        wrongCount: 0,
        totalTimeSeconds: 0,
        joinedAt: new Date().toISOString(),
        answers: [],
        finished: false,
      };
      setCurrentParticipant(p);
    }
    setActiveTab('student-play');
  };

  // Action: Submit student answer
  const handleSubmitAnswer = async (
    participantId: string,
    questionId: string,
    chosenAnswer: number,
    responseTimeSeconds: number
  ) => {
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(activeRoom.roomCode)}/submit-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          questionId,
          chosenAnswer,
          responseTimeSeconds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.room) setActiveRoom(data.room);
          return {
            isCorrect: data.isCorrect,
            correctAnswer: data.correctAnswer,
            explanation: data.explanation,
            scoreAwarded: data.scoreAwarded,
          };
        }
      }
    } catch {
      // Local fallback
    }

    const q = activeRoom.game.questions.find((item) => item.id === questionId);
    const right = q ? chosenAnswer === q.correctAnswer : false;
    const bonus = Math.round(Math.max(0, (20 - responseTimeSeconds) / 20) * 100);
    const awarded = right ? 100 + bonus : 0;
    return {
      isCorrect: right,
      correctAnswer: q ? q.correctAnswer : 0,
      explanation: q ? q.explanation : '',
      scoreAwarded: awarded,
    };
  };

  // Action: Game finished with complete question answers and Supabase sync
  const handleFinishGame = async (finalScore: number, answers: ParticipantAnswer[]) => {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const wrongCount = answers.length - correctCount;
    setFinalGameStats({ score: finalScore, correctCount, wrongCount });

    if (activeRoom && currentParticipant) {
      const totalTime = answers.reduce((acc, a) => acc + (a.responseTime || 0), 0);
      const accuracyRate = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;
      const completedAt = new Date().toISOString();

      const updatedParticipant: Participant = {
        ...currentParticipant,
        score: finalScore,
        correctCount,
        wrongCount,
        totalTimeSeconds: totalTime,
        completedAt,
        answers,
        finished: true,
      };

      const updatedParticipants = activeRoom.participants.map((p) => {
        if (p.id === currentParticipant.id) {
          return updatedParticipant;
        }
        return p;
      });

      if (!updatedParticipants.some((p) => p.id === currentParticipant.id)) {
        updatedParticipants.unshift(updatedParticipant);
      }

      updatedParticipants.sort((a, b) => b.score - a.score);
      updatedParticipants.forEach((p, idx) => {
        p.rank = idx + 1;
      });

      setActiveRoom({ ...activeRoom, participants: updatedParticipants, status: 'ended' });

      // Persist results to server API & Supabase
      try {
        await fetch('/api/results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: currentParticipant.studentName,
            className: currentParticipant.className,
            gameTitle: activeRoom.game.title,
            gameId: activeRoom.game.id,
            roomCode: activeRoom.roomCode,
            score: finalScore,
            correctCount,
            wrongCount,
            accuracyRate,
            totalTimeSeconds: totalTime,
            rank: updatedParticipant.rank || 1,
            answers,
          }),
        });

        // Direct client-side Supabase write
        await saveGameResultToSupabase({
          studentName: currentParticipant.studentName,
          className: currentParticipant.className,
          gameTitle: activeRoom.game.title,
          gameId: activeRoom.game.id,
          roomCode: activeRoom.roomCode,
          score: finalScore,
          correctCount,
          wrongCount,
          accuracyRate,
          totalTimeSeconds: totalTime,
          rank: updatedParticipant.rank || 1,
          answers,
        });
      } catch (err) {
        console.warn('Could not save result to Supabase or server:', err);
      }
    }
    setActiveTab('student-podium');
  };

  // Quick Action: Join Demo Room TIN012
  const handleQuickJoinDemo = () => {
    handleJoinRoom('TIN012', 'Nguyễn Văn An', '12A1');
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Universal Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          sounds.playSpinClick();
          setActiveTab(tab);
        }}
        onJoinDemoRoom={handleQuickJoinDemo}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {/* Landing Page */}
        {activeTab === 'home' && (
          <LandingPage
            onStartCreateAI={() => setActiveTab('teacher-create')}
            onJoinGame={() => setActiveTab('student-join')}
            onSelectGameCard={(game) => handleSelectGameToHost(game)}
            featuredGames={games}
          />
        )}

        {/* Teacher Create AI view */}
        {activeTab === 'teacher-create' && (
          <AIGeneratorView onPublishGame={handlePublishGame} />
        )}

        {/* Teacher Dashboard */}
        {(activeTab === 'teacher-dashboard' || activeTab === 'library') && (
          <TeacherDashboard
            onClassesChange={handleClassesChange}
            teacher={teacher}
            games={games}
            classes={classes}
            activeRoom={activeRoom}
            onSelectGameToHost={handleSelectGameToHost}
            onNavigateToCreateAI={() => setActiveTab('teacher-create')}
            onViewResults={(room) => {
              setActiveRoom(room);
              setActiveTab('results');
            }}
          />
        )}

        {/* Teacher Host Projection Stage */}
        {activeTab === 'teacher-host' && (
          <LiveRoomHostView
            room={activeRoom}
            onStartGame={handleStartGame}
            onJoinAsStudent={() => {
              handleJoinRoom(activeRoom.roomCode, 'Nguyễn Văn An', '12A1');
            }}
          />
        )}

        {/* Student Join Form */}
        {activeTab === 'student-join' && (
          <StudentJoin
            classes={classes}
            onJoinRoom={handleJoinRoom}
            initialRoomCode={
  new URLSearchParams(window.location.search).get('room') || ''
}
          />
        )}

        {/* Student Lobby */}
        {activeTab === 'student-lobby' && currentParticipant && (
          <StudentLobby
            room={activeRoom}
            currentParticipant={currentParticipant}
            onStartGame={handleStartGame}
          />
        )}

        {/* Student Game Play Screen */}
        {activeTab === 'student-play' && currentParticipant && (
          <GamePlayScreen
            room={activeRoom}
            participant={currentParticipant}
            onFinishGame={handleFinishGame}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {/* Student Podium & Leaderboard */}
        {activeTab === 'student-podium' && currentParticipant && (
          <LeaderboardPodium
            room={activeRoom}
            currentParticipant={currentParticipant}
            finalScore={finalGameStats.score}
            correctCount={finalGameStats.correctCount}
            wrongCount={finalGameStats.wrongCount}
            onPlayAgain={() => {
              sounds.playSpinClick();
              setActiveTab('student-play');
            }}
            onGoHome={() => setActiveTab('home')}
            onViewTeacherDashboard={() => setActiveTab('results')}
          />
        )}

        {/* Teacher Detailed Results & Pedagogical AI Analysis & Excel Export */}
        {activeTab === 'results' && (
          <ResultsAnalyticsView 
            room={activeRoom || demoRoomTIN012} 
            classes={classes}
            games={games}
          />
        )}

        {/* About Author View */}
        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
