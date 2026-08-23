'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/auth/auth-context';
import { Trophy, CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';

interface Player {
  studentId: string;
  studentName: string;
  score: number;
}

export function LivePlayerFeature() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const pin = searchParams.get('pin') || '';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'WAITING' | 'QUESTION' | 'ANSWERED' | 'LEADERBOARD' | 'FINISHED' | 'ERROR'>('WAITING');
  const [errorMessage, setErrorMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [myScore, setMyScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [currentQuestionData, setCurrentQuestionData] = useState<any>(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !pin) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '/live-quiz')
      : 'http://localhost:8000/live-quiz';

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_game', { 
        pin, 
        studentId: user.id,
        studentName: user.fullName
      });
    });

    newSocket.on('joined', (data: { success: boolean; message?: string }) => {
      if (!data.success) {
        setGameState('ERROR');
        setErrorMessage(data.message || 'Không thể tham gia phòng');
        newSocket.disconnect();
      }
    });

    newSocket.on('question_started', (data: { questionIndex: number; questionData: any; timeLimit?: number }) => {
      setCurrentQuestionIndex(data.questionIndex);
      setCurrentQuestionData(data.questionData);
      setLastAnswerCorrect(null);
      setGameState('QUESTION');
      setTimeLeft(data.timeLimit ?? null);
    });

    newSocket.on('answer_result', (data: { points: number; isCorrect: boolean }) => {
      setPointsEarned(data.points);
      setLastAnswerCorrect(data.isCorrect);
      setMyScore(prev => prev + data.points);
      setGameState('ANSWERED');
    });

    newSocket.on('leaderboard_updated', (data: Player[]) => {
      setLeaderboard(data);
    });

    newSocket.on('show_leaderboard', (data: { leaderboard: Player[]; timeLimit?: number }) => {
      setLeaderboard(data.leaderboard);
      setGameState('LEADERBOARD');
      setTimeLeft(data.timeLimit ?? null);
    });

    newSocket.on('game_ended', (data: { leaderboard: Player[] }) => {
      setLeaderboard(data.leaderboard);
      setGameState('FINISHED');
      setTimeLeft(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, pin]);

  const handleSubmitAnswer = (isCorrect: boolean) => {
    if (socket && gameState === 'QUESTION') {
      socket.emit('submit_answer', { pin, isCorrect });
      // Optimistic update
      setGameState('ANSWERED');
    }
  };

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  if (gameState === 'ERROR') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Lỗi</h1>
        <p className="text-gray-500">{errorMessage}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 px-6 py-2 bg-gray-200 rounded-xl font-bold hover:bg-gray-300"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (gameState === 'WAITING') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#8BC34A] rounded-[32px] shadow-xl text-white">
        <h1 className="text-3xl font-black mb-8">Bạn đã vào phòng!</h1>
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <p className="text-xl font-bold opacity-80">Đang chờ giáo viên bắt đầu...</p>
      </div>
    );
  }

  if (gameState === 'QUESTION') {
    const qContent = currentQuestionData?.question?.content;
    const qType = currentQuestionData?.question?.type;
    const isSingleChoice = qType === 'SINGLE_CHOICE' || (qContent?.options?.length > 0);
    const isTrueFalse = qType === 'TRUE_FALSE';
    const isSupported = isSingleChoice || isTrueFalse;

    return (
      <div className="min-h-[80vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-8">
           <div className="flex gap-4">
             <div className="bg-white px-4 py-2 rounded-xl font-bold text-gray-700 shadow-sm border-2 border-gray-100">
                Điểm: <span className="text-[#8BC34A]">{myScore}</span>
             </div>
             <div className="bg-white px-4 py-2 rounded-xl font-bold text-gray-700 shadow-sm border-2 border-gray-100">
                Câu {currentQuestionIndex + 1}
             </div>
           </div>
           
           {timeLeft !== null && (
             <div className="bg-[#1f5333] px-4 py-2 rounded-xl font-black text-white shadow-sm border-2 border-[#163f25] flex items-center gap-2">
                <Clock className="w-5 h-5" /> {timeLeft}s
             </div>
           )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
          {qContent?.questionText && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 w-full text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {qContent.questionText}
              </h2>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
             {isSingleChoice && qContent.options.map((opt: any, idx: number) => {
                const optText = typeof opt === 'string' ? opt : opt.text;
                const optId = typeof opt === 'string' ? String.fromCharCode(65 + idx) : opt.id;
                
                const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
                
                // Get correct answer for validation
                const ca = currentQuestionData?.question?.correctAnswer ?? qContent?.correctAnswer ?? qContent?.correct_answer;
                const actualAnswer = typeof ca === 'object' && ca !== null ? ca.answer : ca;
                const isCorrect = (optId === actualAnswer) || (optText === actualAnswer);

                return (
                  <button 
                    key={idx}
                    onClick={() => handleSubmitAnswer(isCorrect)} 
                    className={`${colors[idx % colors.length]} text-white text-xl font-bold p-8 rounded-2xl shadow-md hover:brightness-110 hover:-translate-y-1 transition-all text-left flex items-center gap-4`}
                  >
                    <span className="bg-white/20 w-10 h-10 flex items-center justify-center rounded-full shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{optText}</span>
                  </button>
                );
             })}

             {isTrueFalse && (
                <>
                  {(() => {
                    const ca = currentQuestionData?.question?.correctAnswer ?? qContent?.correctAnswer ?? qContent?.correct_answer;
                    const actualAnswer = typeof ca === 'object' && ca !== null ? ca.answer : ca;
                    return (
                      <>
                        <button 
                          onClick={() => handleSubmitAnswer(actualAnswer === true)} 
                          className="bg-blue-500 text-white text-xl font-bold p-8 rounded-2xl shadow-md hover:brightness-110 hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-4"
                        >
                          ĐÚNG
                        </button>
                        <button 
                          onClick={() => handleSubmitAnswer(actualAnswer === false)} 
                          className="bg-red-500 text-white text-xl font-bold p-8 rounded-2xl shadow-md hover:brightness-110 hover:-translate-y-1 transition-all text-center flex items-center justify-center gap-4"
                        >
                          SAI
                        </button>
                      </>
                    )
                  })()}
                </>
             )}
             
             {!isSupported && (
                <div className="col-span-1 sm:col-span-2 text-center text-gray-500 font-bold bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200">
                  Câu hỏi này không hỗ trợ Live Quiz (hiện tại chỉ hỗ trợ Trắc nghiệm và Đúng/Sai).
                </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ANSWERED') {
    return (
      <div className={`min-h-[80vh] flex flex-col items-center justify-center rounded-[32px] shadow-xl text-white ${lastAnswerCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
        {lastAnswerCorrect ? (
          <>
            <CheckCircle className="w-24 h-24 mb-6" />
            <h1 className="text-4xl font-black mb-2">Chính xác!</h1>
            <p className="text-2xl font-bold opacity-90">+{pointsEarned} điểm</p>
          </>
        ) : (
          <>
            <XCircle className="w-24 h-24 mb-6" />
            <h1 className="text-4xl font-black mb-2">Sai rồi!</h1>
            <p className="text-2xl font-bold opacity-90">0 điểm</p>
          </>
        )}
        <div className="mt-12 bg-black/10 px-8 py-4 rounded-2xl flex items-center gap-3">
           <p className="font-bold text-lg">Chờ bảng xếp hạng...</p>
           {timeLeft !== null && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                 <Clock className="w-4 h-4" /> {timeLeft}s
              </span>
           )}
        </div>
      </div>
    );
  }

  if (gameState === 'LEADERBOARD') {
    const myRank = leaderboard.findIndex(p => p.studentId === user?.id) + 1;
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 rounded-[32px] shadow-xl p-8">
        <Trophy className="w-16 h-16 text-yellow-500 mb-6" />
        <h2 className="text-3xl font-extrabold text-[#1f5333] mb-8">Bảng xếp hạng</h2>
        
        <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-sm p-6 mb-8">
          <div className="text-center mb-6">
            <span className="text-gray-500 font-bold">Thứ hạng của bạn: </span>
            <span className="text-2xl font-black text-[#8BC34A]">#{myRank || '-'}</span>
          </div>
          
          {timeLeft !== null && (
            <div className="flex justify-center mb-6">
              <span className="bg-[#1f5333]/10 text-[#1f5333] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                 <Clock className="w-4 h-4" /> Câu tiếp theo sau {timeLeft}s
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((p, idx) => (
              <div 
                key={p.studentId} 
                className={`p-4 rounded-xl flex justify-between items-center ${
                  p.studentId === user?.id ? 'bg-[#8BC34A]/10 border border-[#8BC34A]/30' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-gray-500">
                    {idx + 1}
                  </div>
                  <span className={`font-bold ${p.studentId === user?.id ? 'text-[#1f5333]' : 'text-gray-700'}`}>
                    {p.studentName} {p.studentId === user?.id && '(Bạn)'}
                  </span>
                </div>
                <span className="font-black text-[#8BC34A]">{p.score} pt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'FINISHED') {
    const myRank = leaderboard.findIndex(p => p.studentId === user?.id) + 1;
    
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 rounded-[32px] shadow-xl p-8">
        <Trophy className="w-24 h-24 text-yellow-500 mb-6" />
        <h1 className="text-4xl font-black text-[#1f5333] mb-2">Kết thúc!</h1>
        
        <div className="bg-white border-2 border-[#dde8a6] px-12 py-8 rounded-3xl shadow-lg mt-8 text-center">
          <p className="text-gray-500 font-bold mb-2">Bạn đạt hạng</p>
          <div className="text-6xl font-black text-[#8BC34A]">{myRank || '-'}</div>
          <p className="text-gray-400 font-bold mt-4">với {myScore} điểm</p>
        </div>

        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="mt-12 px-8 py-3 bg-[#1f5333] text-white rounded-xl font-bold hover:bg-[#163f25] shadow-lg"
        >
          Quay lại Dashboard
        </button>
      </div>
    );
  }

  return null;
}
