'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Users, PlayCircle, Trophy, ArrowRight, Loader2, Settings, Clock } from 'lucide-react';
import { testApi } from '@/lib/api/endpoints/test';

interface LiveHostFeatureProps {
  testId: string;
}

interface Player {
  studentId: string;
  studentName: string;
  score: number;
}

export function LiveHostFeature({ testId }: LiveHostFeatureProps) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [pin, setPin] = useState<string>('');
  const [gameState, setGameState] = useState<'LOBBY' | 'QUESTION' | 'LEADERBOARD' | 'FINISHED'>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const gameMode = searchParams.get('mode') === 'AUTO' ? 'AUTO' : 'MANUAL';
  const qt = searchParams.get('qt') ? Number(searchParams.get('qt')) : 10;
  const lt = searchParams.get('lt') ? Number(searchParams.get('lt')) : 5;

  useEffect(() => {
    // Fetch questions to know how many there are
    testApi.listQuestions({ testId, limit: 100 })
      .then((res) => {
        setQuestions(Array.isArray(res) ? res : (res as any).data || []);
        setLoading(false);
      })
      .catch(console.error);
  }, [testId]);

  useEffect(() => {
    if (!user || loading) return;

    // Use absolute URL to bypass Next.js rewrites for sockets
    const socketUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '/live-quiz')
      : 'http://localhost:8000/live-quiz';

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('host_game', { 
        testId, 
        teacherId: user.id,
        questionCount: questions.length,
        questions,
        gameMode,
        questionTimeLimit: qt,
        leaderboardTimeLimit: lt
      });
    });

    newSocket.on('game_hosted', (data: { pin: string }) => {
      setPin(data.pin);
    });

    newSocket.on('player_joined', (data: Player) => {
      setPlayers(prev => [...prev.filter(p => p.studentId !== data.studentId), data]);
    });

    newSocket.on('leaderboard_updated', (leaderboard: Player[]) => {
      setPlayers(leaderboard);
    });

    newSocket.on('question_started', (data: { questionIndex: number, timeLimit?: number }) => {
      setCurrentQuestionIndex(data.questionIndex);
      setGameState('QUESTION');
      setTimeLeft(data.timeLimit ?? null);
    });

    newSocket.on('show_leaderboard', (data: { leaderboard: Player[], timeLimit?: number }) => {
      setPlayers(data.leaderboard);
      setGameState('LEADERBOARD');
      setTimeLeft(data.timeLimit ?? null);
    });

    newSocket.on('game_ended', (data: { leaderboard: Player[] }) => {
      setPlayers(data.leaderboard);
      setGameState('FINISHED');
      setTimeLeft(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, testId, loading, questions.length]);

  const handleStartGame = () => {
    if (socket && pin) {
      socket.emit('start_game', { pin });
    }
  };

  const handleNextQuestion = () => {
    if (socket && pin) {
      socket.emit('next_question', { pin });
    }
  };

  const handleShowLeaderboard = () => {
    setGameState('LEADERBOARD');
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#1f5333]" /></div>;
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center bg-gray-50 rounded-[32px] overflow-hidden shadow-xl p-8">
      {gameState === 'LOBBY' && (
        <div className="flex flex-col items-center text-center max-w-2xl w-full">
          <h1 className="text-4xl font-extrabold text-[#1f5333] mb-4">Live Game Lobby</h1>
          <p className="text-gray-500 mb-8">Sinh viên cần nhập mã PIN bên dưới để tham gia</p>
          
          <div className="bg-white px-12 py-8 rounded-3xl shadow-lg border-2 border-[#dde8a6] mb-12">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Game PIN</h2>
            <div className="text-7xl font-black text-[#1f5333] tracking-[0.2em] font-mono">
              {pin || '------'}
            </div>
          </div>

          {questions.length === 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Lưu ý! </strong>
              <span className="block sm:inline">Bài kiểm tra này chưa có câu hỏi nào. Bạn cần thêm câu hỏi trước khi tổ chức thi.</span>
            </div>
          )}

          <div className="flex items-center justify-between w-full mb-6">
            <div className="flex items-center gap-2 text-lg font-bold text-gray-700">
              <Users className="w-6 h-6 text-[#1f5333]" />
              {players.length} Học sinh
            </div>
            <button
              onClick={handleStartGame}
              disabled={players.length === 0}
              className="flex items-center gap-2 px-8 py-4 bg-[#1f5333] text-white font-bold rounded-2xl hover:bg-[#163f25] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg hover:shadow-xl"
            >
              <PlayCircle className="w-6 h-6" />
              Bắt đầu ngay
            </button>
          </div>

          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
            {players.map(p => (
              <div key={p.studentId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 font-bold text-gray-800">
                {p.studentName}
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === 'QUESTION' && (
        <div className="flex flex-col w-full max-w-4xl h-full">
          <div className="flex justify-between items-center mb-8">
            <span className="bg-white px-4 py-2 rounded-xl font-bold text-gray-500 shadow-sm">
              Câu hỏi {currentQuestionIndex + 1} / {questions.length}
            </span>
            {timeLeft !== null && (
              <span className="bg-[#1f5333] px-4 py-2 rounded-xl font-black text-white shadow-sm flex items-center gap-2">
                <Clock className="w-5 h-5" /> {timeLeft}s
              </span>
            )}
            {gameMode === 'MANUAL' && (
              <button 
                onClick={handleShowLeaderboard}
                className="bg-[#1f5333] text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-[#163f25] flex items-center gap-2"
              >
                Dừng & Xem Bảng xếp hạng <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="bg-white p-12 rounded-3xl shadow-lg border border-gray-100 flex-1 flex items-center justify-center text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
              {questions[currentQuestionIndex]?.question?.content?.questionText || 'Câu hỏi'}
            </h2>
          </div>
        </div>
      )}

      {gameState === 'LEADERBOARD' && (
        <div className="flex flex-col w-full max-w-3xl items-center">
          <h2 className="text-3xl font-extrabold text-[#1f5333] mb-8 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" /> Bảng xếp hạng tạm thời
          </h2>
          
          <div className="w-full space-y-3 mb-10">
            {players.map((p, idx) => (
              <div key={p.studentId} className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-lg text-gray-800">{p.studentName}</span>
                </div>
                <span className="font-black text-xl text-[#1f5333]">{p.score} pt</span>
              </div>
            ))}
          </div>

          {gameMode === 'MANUAL' ? (
            <button 
              onClick={handleNextQuestion}
              className="bg-[#1f5333] text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-[#163f25] flex items-center gap-2 text-xl"
            >
              Câu tiếp theo <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <div className="text-gray-500 font-bold flex flex-col items-center">
              <span className="animate-pulse mb-2">Đang chuẩn bị câu hỏi tiếp theo...</span>
              {timeLeft !== null && (
                <span className="bg-gray-200 px-4 py-2 rounded-full text-gray-700 text-sm">
                  {timeLeft} giây
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="flex flex-col items-center">
          <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
          <h1 className="text-5xl font-black text-[#1f5333] mb-12">Kết quả chung cuộc</h1>
          
          <div className="flex items-end justify-center gap-6 mb-12 h-64">
             {/* Podium UI could be added here, for now just simple list */}
             <div className="w-full space-y-3 max-w-2xl">
              {players.map((p, idx) => (
                <div key={p.studentId} className="bg-white p-5 rounded-2xl shadow-sm flex justify-between items-center border border-gray-100 w-full min-w-[400px]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-500">
                      {idx + 1}
                    </div>
                    <span className="font-bold text-lg text-gray-800">{p.studentName}</span>
                  </div>
                  <span className="font-black text-xl text-[#1f5333]">{p.score} pt</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
