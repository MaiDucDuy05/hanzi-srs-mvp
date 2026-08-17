import { Signal } from './game-core';
import type { QuestionItem } from '../../practice/components/practice-models';
import { normalizePinyin } from '../utils/pinyin-utils';

export interface Target {
  id: string;
  itemId: string;
  hanzi: string;
  pinyinDisplay: string;
  pinyinTyped: string;
  typedCount: number;
  fullyTyped: boolean;
  x: number;
  y: number;
  speed: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  targetId: string;
  speed: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

export interface ShooterCtx {
  phase: 'idle' | 'playing' | 'paused' | 'gameover' | 'completed';
  targets: Target[];
  bullets: Bullet[];
  particles: Particle[];
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  maxCombo: number;
  correctKeystrokes: number;
  wrongKeystrokes: number;
  completedWords: number;
  timeElapsed: number;
  difficulty: number;
}

export interface ShooterConfig {
  initialHp: number;
  spawnRateMs: number; // Initial time between spawns
  minSpawnRateMs: number;
  baseFallSpeed: number; // Initial Y percentage per second
  maxFallSpeed: number;
  difficultyRamp: number; // How much difficulty increases per second
  bulletSpeed: number; // Y percentage per second
}

const DEFAULT_CONFIG: ShooterConfig = {
  initialHp: 5,
  spawnRateMs: 4500, // Slower initial spawn rate (1 balloon every 4.5s)
  minSpawnRateMs: 1200,
  baseFallSpeed: 2.5, // Slower initial fall speed (takes 40s to reach bottom)
  maxFallSpeed: 18,
  difficultyRamp: 0.012, // More gradual difficulty curve
  bulletSpeed: 150,
};

export class ShooterSec {
  private ctx: ShooterCtx;
  private config: ShooterConfig;
  private items: QuestionItem[] = [];
  
  private lastSpawnTime = 0;
  private targetIdCounter = 0;
  private bulletIdCounter = 0;
  private particleIdCounter = 0;

  readonly onDamage = new Signal<void>();
  readonly onGameOver = new Signal<{ score: number; combo: number; maxCombo: number; correct: number; wrong: number }>();
  readonly onHit = new Signal<{ targetId: string }>();
  readonly onTargetDestroyed = new Signal<{ targetId: string }>();
  readonly onWrongKey = new Signal<void>();
  readonly onScore = new Signal<{ amount: number }>();

  constructor(items: QuestionItem[], config: Partial<ShooterConfig> = {}) {
    this.items = [...items];
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ctx = this.getInitialState();
  }

  private getInitialState(): ShooterCtx {
    return {
      phase: 'idle',
      targets: [],
      bullets: [],
      particles: [],
      hp: this.config.initialHp,
      maxHp: this.config.initialHp,
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctKeystrokes: 0,
      wrongKeystrokes: 0,
      completedWords: 0,
      timeElapsed: 0,
      difficulty: 1,
    };
  }

  start(): void {
    if (this.items.length === 0) return;
    this.ctx = this.getInitialState();
    this.ctx.phase = 'playing';
    this.lastSpawnTime = 0;
  }

  pause(): void {
    if (this.ctx.phase === 'playing') {
      this.ctx.phase = 'paused';
    }
  }

  resume(): void {
    if (this.ctx.phase === 'paused') {
      this.ctx.phase = 'playing';
    }
  }

  getState(): ShooterCtx {
    return this.ctx;
  }

  tick(dtMs: number): void {
    if (this.ctx.phase !== 'playing') return;

    this.ctx.timeElapsed += dtMs;
    
    // Increase difficulty over time
    this.ctx.difficulty = 1 + (this.ctx.timeElapsed / 1000) * this.config.difficultyRamp;
    
    this.updateTargets(dtMs);
    this.updateBullets(dtMs);
    this.updateParticles(dtMs);
    this.checkSpawns();
  }

  private updateTargets(dtMs: number): void {
    const dtSec = dtMs / 1000;
    
    for (let i = this.ctx.targets.length - 1; i >= 0; i--) {
      const t = this.ctx.targets[i];
      
      // Fully typed targets stop falling (waiting for bullets to hit)
      if (!t.fullyTyped) {
        t.y += t.speed * dtSec;
      }
      
      if (t.y >= 100) {
        // Target reached bottom
        this.spawnParticles(t.x, t.y, 15, '#ef4444'); // Red explosion on crash
        this.ctx.targets.splice(i, 1);
        this.takeDamage();
      }
    }
  }

  private updateBullets(dtMs: number): void {
    const dtSec = dtMs / 1000;
    const hitRadius = 5; // percentage distance to consider a hit

    for (let i = this.ctx.bullets.length - 1; i >= 0; i--) {
      const b = this.ctx.bullets[i];
      const target = this.ctx.targets.find(t => t.id === b.targetId);
      
      if (!target) {
        // Target is gone, just move bullet straight up and remove if offscreen
        b.y -= this.config.bulletSpeed * dtSec;
        if (b.y < -10) this.ctx.bullets.splice(i, 1);
        continue;
      }
      
      // Homing behavior
      const dx = target.x - b.x;
      const dy = target.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= hitRadius) {
        // Hit!
        this.ctx.bullets.splice(i, 1);
        this.onHit.dispatch({ targetId: target.id });
        
        // Spawn small hit particles
        this.spawnParticles(target.x, target.y, 3, '#aadd4a');

        if (target.fullyTyped) {
          // Check if this was the last bullet needed
          // We can just destroy the target when the last bullet hits
          // Wait, multiple bullets could be travelling. Let's count them or just destroy on hit if fullyTyped.
          // Since the player typed it fully, and bullets travel fast, the first bullet to hit while fullyTyped destroys it?
          // No, if the word has 5 chars, there are 5 bullets. We should let all 5 hit or destroy on the last one.
          // Simplest: just destroy it if it's fully typed and a bullet hits it. Wait, other bullets will just fly off. That's fine.
          // Actually, let's keep a hitsReceived counter on target, if hitsReceived == pinyinTyped.length, destroy.
          // Since we don't have that, let's just destroy it and let remaining bullets fly off.
          this.ctx.targets = this.ctx.targets.filter(t => t.id !== target.id);
          this.onTargetDestroyed.dispatch({ targetId: target.id });
          this.spawnParticles(target.x, target.y, 10, '#ff9800'); // Explosion
        }
      } else {
        // Move towards target
        const vx = (dx / dist) * this.config.bulletSpeed;
        const vy = (dy / dist) * this.config.bulletSpeed;
        b.x += vx * dtSec;
        b.y += vy * dtSec;
      }
    }
  }

  private updateParticles(dtMs: number): void {
    const dtSec = dtMs / 1000;
    for (let i = this.ctx.particles.length - 1; i >= 0; i--) {
      const p = this.ctx.particles[i];
      p.life -= dtMs;
      if (p.life <= 0) {
        this.ctx.particles.splice(i, 1);
      } else {
        p.x += p.vx * dtSec;
        p.y += p.vy * dtSec;
        p.vy += 50 * dtSec; // Gravity effect
      }
    }
  }

  private checkSpawns(): void {
    // Current spawn rate based on difficulty
    const currentSpawnRate = Math.max(
      this.config.minSpawnRateMs, 
      this.config.spawnRateMs / Math.sqrt(this.ctx.difficulty)
    );

    if (this.ctx.timeElapsed - this.lastSpawnTime >= currentSpawnRate) {
      this.spawnTarget();
      this.lastSpawnTime = this.ctx.timeElapsed;
    }
  }

  private spawnTarget(): void {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    const pinyinTyped = normalizePinyin(item.pinyin);
    
    // Ignore items that can't be typed (e.g. empty)
    if (!pinyinTyped) return;

    const speed = Math.min(
      this.config.maxFallSpeed,
      this.config.baseFallSpeed * this.ctx.difficulty * (0.8 + Math.random() * 0.4) // random variance
    );

    this.ctx.targets.push({
      id: `target_${this.targetIdCounter++}`,
      itemId: item.id,
      hanzi: item.hanzi,
      pinyinDisplay: item.pinyin,
      pinyinTyped,
      typedCount: 0,
      fullyTyped: false,
      x: 10 + Math.random() * 80, // 10% to 90% width
      y: -10, // Start just above screen
      speed,
    });
  }

  private takeDamage(): void {
    this.ctx.hp -= 1;
    this.ctx.combo = 0;
    this.onDamage.dispatch();
    
    if (this.ctx.hp <= 0) {
      this.ctx.phase = 'gameover';
      this.onGameOver.dispatch({
        score: this.ctx.score,
        combo: this.ctx.combo,
        maxCombo: this.ctx.maxCombo,
        correct: this.ctx.correctKeystrokes,
        wrong: this.ctx.wrongKeystrokes
      });
    }
  }

  handleKeystroke(key: string): void {
    if (this.ctx.phase !== 'playing') return;
    
    const char = key.toLowerCase();
    if (!/^[a-z]$/.test(char)) return; // Only process letters

    // Find the currently active target (one that is partially typed)
    let activeTarget = this.ctx.targets.find(t => t.typedCount > 0 && !t.fullyTyped);

    if (activeTarget) {
      this.checkTargetChar(activeTarget, char);
    } else {
      // Find a new target whose first character matches the input
      // Sort by Y descending so we prioritize targets closest to bottom
      const availableTargets = this.ctx.targets
        .filter(t => t.typedCount === 0 && !t.fullyTyped && t.pinyinTyped[0] === char)
        .sort((a, b) => b.y - a.y);

      if (availableTargets.length > 0) {
        this.checkTargetChar(availableTargets[0], char);
      } else {
        // No match found
        this.handleWrongKey();
      }
    }
  }

  private checkTargetChar(target: Target, char: string): void {
    const expectedChar = target.pinyinTyped[target.typedCount];
    if (char === expectedChar) {
      // Correct!
      target.typedCount++;
      this.ctx.correctKeystrokes++;
      this.ctx.combo++;
      if (this.ctx.combo > this.ctx.maxCombo) {
        this.ctx.maxCombo = this.ctx.combo;
      }

      // Add score (more score for higher combo)
      const scoreGain = 10 * (1 + Math.floor(this.ctx.combo / 10));
      this.ctx.score += scoreGain;
      this.onScore.dispatch({ amount: scoreGain });

      // Fire a bullet
      this.ctx.bullets.push({
        id: `bullet_${this.bulletIdCounter++}`,
        x: 50, // player cannon is at 50% width
        y: 80, // player cannon is slightly higher now
        targetId: target.id,
        speed: this.config.bulletSpeed
      });

      if (target.typedCount === target.pinyinTyped.length) {
        target.fullyTyped = true;
        this.ctx.completedWords++;
        // Bonus score for full word
        const completionBonus = 50 * (1 + Math.floor(this.ctx.combo / 10));
        this.ctx.score += completionBonus;
        this.onScore.dispatch({ amount: completionBonus });
      }
    } else {
      // Wrong key for the active target
      this.handleWrongKey();
    }
  }

  private handleWrongKey(): void {
    this.ctx.combo = 0;
    this.ctx.wrongKeystrokes++;
    this.onWrongKey.dispatch();
  }

  private spawnParticles(x: number, y: number, count: number, color: string): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 10 + Math.random() * 20;
      this.ctx.particles.push({
        id: `p_${this.particleIdCounter++}`,
        x,
        y,
        color,
        life: 300 + Math.random() * 300,
        maxLife: 600,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }

  destroy(): void {
    this.onDamage.clear();
    this.onGameOver.clear();
    this.onHit.clear();
    this.onTargetDestroyed.clear();
    this.onWrongKey.clear();
    this.onScore.clear();
  }
}
