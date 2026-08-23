import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveQuizService } from './live-quiz.service';
import { UseGuards, Logger } from '@nestjs/common';
// We might not use strict JwtAuthGuard on WebSocket due to handshake limitations,
// but we expect token or user ID to be passed in payload for auth.

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/live-quiz',
})
export class LiveQuizGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LiveQuizGateway.name);

  constructor(private readonly liveQuizService: LiveQuizService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Check if it was a teacher
    const teacherGame = this.liveQuizService.getGameByTeacherSocket(client.id);
    if (teacherGame) {
      // If teacher disconnects unexpectedly, we could notify players, but for MVP let's just log
      this.logger.log(`Teacher disconnected from game ${teacherGame.pin}`);
    }

    // Check if it was a player
    const pin = this.liveQuizService.removePlayer(client.id);
    if (pin) {
       this.server.to(pin).emit('player_left', { socketId: client.id });
       this.server.to(pin).emit('leaderboard_updated', this.liveQuizService.getLeaderboard(pin));
    }
  }

  @SubscribeMessage('host_game')
  handleHostGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { 
      testId: string; 
      teacherId: string; 
      questions: any[]; 
      gameMode?: 'MANUAL' | 'AUTO'; 
      questionTimeLimit?: number; 
      leaderboardTimeLimit?: number; 
    },
  ) {
    const pin = this.liveQuizService.createGame(
      data.testId, 
      data.teacherId, 
      client.id, 
      data.questions,
      data.gameMode,
      data.questionTimeLimit,
      data.leaderboardTimeLimit
    );
    client.join(pin);
    return { event: 'game_hosted', data: { pin } };
  }

  @SubscribeMessage('join_game')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pin: string; studentId: string; studentName: string },
  ) {
    const success = this.liveQuizService.joinGame(data.pin, client.id, data.studentId, data.studentName);
    if (success) {
      client.join(data.pin);
      // Notify everyone in the room that a player joined
      this.server.to(data.pin).emit('player_joined', { 
        studentId: data.studentId, 
        studentName: data.studentName,
        score: 0
      });
      this.server.to(data.pin).emit('leaderboard_updated', this.liveQuizService.getLeaderboard(data.pin));
      return { event: 'joined', data: { success: true } };
    }
    return { event: 'joined', data: { success: false, message: 'Game not found or already started' } };
  }

  @SubscribeMessage('start_game')
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pin: string },
  ) {
    const game = this.liveQuizService.getGame(data.pin);
    if (game && game.teacherSocketId === client.id) {
      this.liveQuizService.startGame(data.pin);
      this.server.to(data.pin).emit('game_started', {});
      
      // Automatically go to first question
      this.triggerNextQuestion(data.pin);
    }
  }

  @SubscribeMessage('next_question')
  handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pin: string },
  ) {
    const game = this.liveQuizService.getGame(data.pin);
    if (game && game.teacherSocketId === client.id) {
      this.triggerNextQuestion(data.pin);
    }
  }

  private triggerNextQuestion(pin: string) {
    const result = this.liveQuizService.nextQuestion(pin);
    if (!result) return;

    if (result.questionData === null) {
      this.server.to(pin).emit('game_ended', { 
        leaderboard: this.liveQuizService.getLeaderboard(pin) 
      });
    } else {
      const game = this.liveQuizService.getGame(pin);
      
      this.server.to(pin).emit('question_started', { 
        questionIndex: result.index,
        questionData: result.questionData,
        timeLimit: game?.gameMode === 'AUTO' ? game.questionTimeLimit : null
      });

      if (game && game.gameMode === 'AUTO') {
        const timer = setTimeout(() => {
          this.triggerShowLeaderboard(pin);
        }, game.questionTimeLimit * 1000);
        this.liveQuizService.setGameTimer(pin, timer);
      }
    }
  }

  private triggerShowLeaderboard(pin: string) {
    this.liveQuizService.showLeaderboard(pin);
    const game = this.liveQuizService.getGame(pin);
    
    this.server.to(pin).emit('show_leaderboard', {
      leaderboard: this.liveQuizService.getLeaderboard(pin),
      timeLimit: game?.gameMode === 'AUTO' ? game.leaderboardTimeLimit : null
    });

    if (game && game.gameMode === 'AUTO') {
      const timer = setTimeout(() => {
        this.triggerNextQuestion(pin);
      }, game.leaderboardTimeLimit * 1000);
      this.liveQuizService.setGameTimer(pin, timer);
    }
  }

  @SubscribeMessage('submit_answer')
  handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { pin: string; isCorrect: boolean },
  ) {
    const { points, allAnswered } = this.liveQuizService.submitAnswer(data.pin, client.id, data.isCorrect);
    
    // Notify the specific player about their result
    client.emit('answer_result', { points, isCorrect: data.isCorrect });

    // Update leaderboard for everyone
    this.server.to(data.pin).emit('leaderboard_updated', this.liveQuizService.getLeaderboard(data.pin));

    const game = this.liveQuizService.getGame(data.pin);
    if (game && game.gameMode === 'AUTO' && allAnswered) {
      this.triggerShowLeaderboard(data.pin);
    }
  }
}
