import { Test, TestingModule } from '@nestjs/testing';
import { LiveQuizService } from './live-quiz.service';

describe('LiveQuizService', () => {
  let service: LiveQuizService;

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [LiveQuizService],
    }).compile();
    service = mod.get(LiveQuizService);
  });

  it('createGame stores a new game and returns a 6-digit PIN', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [
      { id: 'q1' },
      { id: 'q2' },
    ]);
    expect(pin).toMatch(/^\d{6}$/);
    const game = service.getGame(pin);
    expect(game?.testId).toBe('t1');
    expect(game?.status).toBe('LOBBY');
    expect(game?.questionCount).toBe(2);
  });

  it('createGame replaces previous active game by same teacher', () => {
    const first = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    const second = service.createGame('t1', 'teacher-1', 's2', [{ id: 'q2' }]);
    expect(service.getGame(first)).toBeUndefined();
    expect(service.getGame(second)).toBeDefined();
  });

  it('createGame keeps finished game', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    service.getGame(pin)!.status = 'FINISHED';
    const second = service.createGame('t1', 'teacher-1', 's2', [{ id: 'q2' }]);
    expect(service.getGame(pin)).toBeDefined();
    expect(service.getGame(second)).toBeDefined();
  });

  it('joinGame rejects unknown pin', () => {
    expect(service.joinGame('000000', 's1', 'st1', 'Alice')).toBe(false);
  });

  it('joinGame adds player and removes old socket for same studentId', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    service.joinGame(pin, 'sock-1', 'st1', 'Alice');
    service.joinGame(pin, 'sock-2', 'st1', 'Alice');
    const game = service.getGame(pin)!;
    expect(game.players.size).toBe(1);
    expect(game.players.get('sock-2')).toBeDefined();
  });

  it('joinGame returns false when game is IN_PROGRESS', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    service.startGame(pin);
    expect(service.joinGame(pin, 'sock-1', 'st1', 'Alice')).toBe(false);
  });

  it('startGame transitions LOBBY -> IN_PROGRESS', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    expect(service.startGame(pin)).toBe(true);
    expect(service.getGame(pin)!.status).toBe('IN_PROGRESS');
  });

  it('nextQuestion increments index and returns question data', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [
      { id: 'q1' },
      { id: 'q2' },
    ]);
    service.startGame(pin);
    const first = service.nextQuestion(pin);
    expect(first?.index).toBe(0);
    expect(first?.questionData).toEqual({ id: 'q1' });
    const second = service.nextQuestion(pin);
    expect(second?.index).toBe(1);
    const finished = service.nextQuestion(pin);
    expect(finished?.questionData).toBeNull();
    expect(service.getGame(pin)!.status).toBe('FINISHED');
  });

  it('submitAnswer awards decreasing points and reports allAnswered', async () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }], 'MANUAL', 10);
    service.joinGame(pin, 's2', 'st1', 'Alice');
    service.joinGame(pin, 's3', 'st2', 'Bob');
    service.startGame(pin);
    service.nextQuestion(pin);
    await new Promise((r) => setTimeout(r, 5));
    const r1 = service.submitAnswer(pin, 's2', true);
    expect(r1.points).toBeGreaterThanOrEqual(500);
    expect(r1.points).toBeLessThanOrEqual(1000);
    expect(r1.allAnswered).toBe(false);
    const r2 = service.submitAnswer(pin, 's3', false);
    expect(r2.allAnswered).toBe(true);
    expect(r2.points).toBe(0);
  });

  it('submitAnswer returns 0 for non-IN_PROGRESS game', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    expect(service.submitAnswer(pin, 's2', true)).toEqual({ points: 0, allAnswered: false });
  });

  it('showLeaderboard sorts players by score', async () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    service.joinGame(pin, 's2', 'st1', 'Alice');
    service.joinGame(pin, 's3', 'st2', 'Bob');
    service.startGame(pin);
    service.nextQuestion(pin);
    await new Promise((r) => setTimeout(r, 5));
    service.submitAnswer(pin, 's2', true);
    service.submitAnswer(pin, 's3', true);
    service.showLeaderboard(pin);
    const lb = service.getLeaderboard(pin);
    expect(lb).toHaveLength(2);
    expect(lb[0].score).toBeGreaterThanOrEqual(lb[1].score);
  });

  it('removePlayer returns null when socket unknown', () => {
    expect(service.removePlayer('unknown')).toBeNull();
  });

  it('removePlayer deletes player and returns pin', () => {
    const pin = service.createGame('t1', 'teacher-1', 's1', [{ id: 'q1' }]);
    service.joinGame(pin, 's2', 'st1', 'Alice');
    const removed = service.removePlayer('s2');
    expect(removed).toBe(pin);
    expect(service.getGame(pin)!.players.size).toBe(0);
  });
});
