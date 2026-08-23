import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

export interface Player {
  socketId: string;
  studentId: string;
  studentName: string;
  score: number;
  answeredCurrent: boolean;
}

export interface LiveGame {
  pin: string;
  testId: string;
  teacherId: string;
  teacherSocketId: string;
  status: 'LOBBY' | 'IN_PROGRESS' | 'LEADERBOARD' | 'FINISHED';
  players: Map<string, Player>; // Key: socketId
  currentQuestionIndex: number;
  questionStartTime?: number;
  questionCount: number;
  questions: any[];
  gameMode: 'MANUAL' | 'AUTO';
  questionTimeLimit: number;
  leaderboardTimeLimit: number;
  timerCallback?: NodeJS.Timeout;
}

@Injectable()
export class LiveQuizService {
  private readonly logger = new Logger(LiveQuizService.name);
  // Map of PIN -> LiveGame
  private activeGames = new Map<string, LiveGame>();

  private generatePin(): string {
    let pin;
    do {
      // 6 digit string
      pin = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.activeGames.has(pin));
    return pin;
  }

  createGame(
    testId: string, 
    teacherId: string, 
    teacherSocketId: string, 
    questions: any[],
    gameMode: 'MANUAL' | 'AUTO' = 'MANUAL',
    questionTimeLimit: number = 10,
    leaderboardTimeLimit: number = 5
  ): string {
    // End existing games by this teacher if any (optional, or just let them have multiple)
    for (const [pin, game] of this.activeGames.entries()) {
      if (game.teacherId === teacherId && game.status !== 'FINISHED') {
        if (game.timerCallback) clearTimeout(game.timerCallback);
        this.activeGames.delete(pin);
      }
    }

    const pin = this.generatePin();
    this.activeGames.set(pin, {
      pin,
      testId,
      teacherId,
      teacherSocketId,
      status: 'LOBBY',
      players: new Map(),
      currentQuestionIndex: -1,
      questionCount: questions.length,
      questions,
      gameMode,
      questionTimeLimit,
      leaderboardTimeLimit,
    });
    
    this.logger.log(`Game created with PIN ${pin} for test ${testId} (Mode: ${gameMode})`);
    return pin;
  }

  getGame(pin: string): LiveGame | undefined {
    return this.activeGames.get(pin);
  }

  getGameByTeacherSocket(socketId: string): LiveGame | undefined {
     for (const game of this.activeGames.values()) {
        if (game.teacherSocketId === socketId && game.status !== 'FINISHED') {
           return game;
        }
     }
     return undefined;
  }
  
  getGameByPlayerSocket(socketId: string): LiveGame | undefined {
     for (const game of this.activeGames.values()) {
        if (game.players.has(socketId) && game.status !== 'FINISHED') {
           return game;
        }
     }
     return undefined;
  }

  joinGame(pin: string, socketId: string, studentId: string, studentName: string): boolean {
    const game = this.activeGames.get(pin);
    if (!game || game.status !== 'LOBBY') return false;

    // Check if student already joined with different socket
    for (const [sId, p] of game.players.entries()) {
      if (p.studentId === studentId) {
        game.players.delete(sId); // Remove old socket
      }
    }

    game.players.set(socketId, {
      socketId,
      studentId,
      studentName,
      score: 0,
      answeredCurrent: false,
    });
    
    this.logger.log(`Player ${studentName} joined game ${pin}`);
    return true;
  }

  startGame(pin: string): boolean {
    const game = this.activeGames.get(pin);
    if (!game || game.status !== 'LOBBY') return false;
    
    game.status = 'IN_PROGRESS';
    return true;
  }

  setGameTimer(pin: string, timer: NodeJS.Timeout) {
    const game = this.activeGames.get(pin);
    if (game) {
      if (game.timerCallback) clearTimeout(game.timerCallback);
      game.timerCallback = timer;
    }
  }

  clearGameTimer(pin: string) {
    const game = this.activeGames.get(pin);
    if (game && game.timerCallback) {
      clearTimeout(game.timerCallback);
      game.timerCallback = undefined;
    }
  }

  nextQuestion(pin: string): { index: number; questionData: any } | null {
    const game = this.activeGames.get(pin);
    if (!game) return null;

    this.clearGameTimer(pin);

    game.currentQuestionIndex++;
    game.questionStartTime = Date.now();
    game.status = 'IN_PROGRESS';
    
    // Reset answered status
    for (const player of game.players.values()) {
      player.answeredCurrent = false;
    }

    if (game.currentQuestionIndex >= game.questionCount) {
      game.status = 'FINISHED';
      return { index: game.currentQuestionIndex, questionData: null };
    }
    
    return { 
      index: game.currentQuestionIndex, 
      questionData: game.questions[game.currentQuestionIndex] 
    };
  }

  // Returns { points: number, allAnswered: boolean }
  submitAnswer(pin: string, socketId: string, isCorrect: boolean): { points: number; allAnswered: boolean } {
    const game = this.activeGames.get(pin);
    if (!game || game.status !== 'IN_PROGRESS' || !game.questionStartTime) return { points: 0, allAnswered: false };

    const player = game.players.get(socketId);
    if (!player || player.answeredCurrent) return { points: 0, allAnswered: false };

    player.answeredCurrent = true;

    let points = 0;
    if (isCorrect) {
      // Calculate score based on time elapsed
      const maxScore = 1000;
      const timeElapsed = Date.now() - game.questionStartTime;
      const maxTime = game.questionTimeLimit * 1000;

      if (timeElapsed > 0 && timeElapsed < maxTime) {
         // Decrease linearly down to 500 points
         points = Math.round(maxScore - (500 * (timeElapsed / maxTime)));
      } else if (timeElapsed >= maxTime) {
         points = 500; // Minimum 500 if correct but slow
      }

      player.score += points;
    }

    // Check if all players answered
    let allAnswered = true;
    for (const p of game.players.values()) {
      if (!p.answeredCurrent) {
        allAnswered = false;
        break;
      }
    }
    
    return { points, allAnswered };
  }

  showLeaderboard(pin: string) {
    const game = this.activeGames.get(pin);
    if (!game) return;
    this.clearGameTimer(pin);
    game.status = 'LEADERBOARD';
  }

  getLeaderboard(pin: string) {
    const game = this.activeGames.get(pin);
    if (!game) return [];

    const players = Array.from(game.players.values());
    players.sort((a, b) => b.score - a.score);

    return players.map((p, index) => ({
      rank: index + 1,
      studentId: p.studentId,
      studentName: p.studentName,
      score: p.score,
    }));
  }

  removePlayer(socketId: string) {
     const game = this.getGameByPlayerSocket(socketId);
     if (game) {
        game.players.delete(socketId);
        return game.pin;
     }
     return null;
  }
}
