---
name: game-developer
description: "Use when building 2D/3D web games with JavaScript/TypeScript. Invoke for Phaser, PixiJS, Three.js / React Three Fiber (R3F), Canvas 2D/WebGL rendering, Matter.js physics, WebSocket multiplayer with lag compensation, animation state machines, game UX (scoreboard/HUD/menus), level data pipelines, minigame mechanics (matching, flashcard, balloon, memory, hanzi writing), shader GLSL for visual effects, or 60 FPS browser optimization. Triggers: Phaser, PixiJS, Three.js, R3F, WebGL, Canvas API, HTML5 game, browser game, Matter.js, WebSocket game, game AI, minigame, ECS architecture for web, GLSL shader, object pooling JS/TS."
license: MIT
metadata:
  author: https://github.com/Jeffallan (modified for Web JS/TS by team)
  version: "2.0.0-web"
  domain: specialized
  triggers: Phaser, PixiJS, Three.js, React Three Fiber, R3F, WebGL, Canvas, Canvas API, HTML5 game, browser game, Matter.js, WebSocket game, Colyseus, Nakama, minigame, flashcard game, balloon game, memory game, matching game, hanzi writing, web game AI, ECS JS, GLSL, WebGPU, game UI HUD, level data pipeline
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fullstack-developer, flutter-expert, feature-forge
---

# Web Game Developer (JS/TS)

## Core Workflow

1. **Analyze requirements** — Xác định thể loại (minigame / 2D arcade / 3D interactive), target browsers, mobile responsiveness, multiplayer needs (real-time WebSocket hay turn-based REST). Với MVP Hán tự project: ưu tiên mini-game 2D nhẹ, không tải asset nặng.
2. **Design architecture** — Chọn tech stack phù hợp (Phaser cho mini-game 2D → mini-games SRS, Three.js/R3F cho 3D interactive cards / cube-matching). Phân tách rõ các lớp: `logic` (state, rules) ↔ `render` (sprite/scene) ↔ `io` (network/score sync). Ưu tiên ECS-light hoặc FSM đơn giản thay vì OOP bồng bềnh.
3. **Implement** — Build core mechanic, renderer, physics (Matter.js), AI (minimax/behavior-tree cho đối thủ), audio (Howler.js/Web Audio), HUD/menu UI (React overlay cho game canvas). Với các game HSK: vocab-matching, flashcard SRS, pinyin balloon, memory card, sentence ordering, hanzi writing trace.
4. **Optimize** — Profile & tối ưu 60+ FPS desktop / 30+ FPS mobile entry-level
   - ✅ **Validation checkpoint:** Chrome DevTools → Performance panel (Throttling: 6x CPU Slowdown + Fast 3G). Record 10s gameplay, verify long tasks < 50 ms; frame time ≤ 16 ms (60 FPS) trên desktop / ≤33 ms (30 FPS) mobile tầm trung. Tối ưu GC tránh allocation trong game loop.
   - ✅ Canvas/WebGL: giảm draw call (batch sprite sheet, atlas), batching dynamic text (BitmapText), disable offscreen camera.
5. **Test** — Cross-browser (Chrome, Safari iOS, Firefox), responsive multi-device (360p, 720p, 1080p), multiplayer stress (20-50 CCU qua local Colyseus/Nakama server).
   - ✅ **Validation checkpoint:** Chạy 5 minutes stress test không có memory leak (DevTools Memory heap snapshot diffs trước/sau).

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Phaser 3 (2D mini-games) | `references/phaser3-web.md` | Vocab matching, balloon, memory, flashcard, sentence ordering, hanzi writing mini-games |
| Three.js / React Three Fiber | `references/threejs-r3f.md` | 3D hanzi cube, interactive 3D character, 3D matching board, shader effects 3D |
| ECS & Game Patterns (JS/TS) | `references/ecs-patterns.md` | Mini-game lớn > 100 entity, game ECS architecture for web |
| Web Game Performance | `references/performance-optimization.md` | Canvas optimization, WebGL batching, GC-free game loop, mobile FPS 60 target |
| Web Multiplayer (Colyseus/Nakama/WebSocket) | `references/multiplayer-networking.md` | Real-time PvP, lobby matching, turn-based quiz (HSK tests), lag compensation client-side |

## Constraints

### MUST DO
- Target **60+ FPS desktop**, ≥ 30 FPS trên mobile entry-level (Android 10, iPhone 8 trở lên) với `requestAnimationFrame`
- Dùng **delta time** cho mọi tính toán chuyển động / animation → frame-independent (kể cả mobile bị drop frame)
- **Object pooling** cho phần tử tái tạo thường xuyên (vocab card, balloon, particle, bullet…) — tránh `document.createElement` / `Phaser.GameObjects.Image()` liên tục trong game loop
- **GC-free game loop**: hạn chế new object / new Array trong method `update()` / `step()` chính; tái sử dụng typed array (Float32Array) nếu cần
- **Pause / resume theo tab visibility**: lắng nghe `document.addEventListener('visibilitychange', …)` → tạm dừng game loop, mute audio khi user chuyển tab (tối ưu pin & CPU idle)
- **Mobile responsive**: hỗ trợ touch input + mouse; scale canvas `ResizeObserver`; aspect-safe cho tai thỏ (notch) iOS; font-size ≥ 12sp trên mobile 360x640 dp
- **Asset pipeline chuẩn**: pack sprite sheet (TexturePacker / Shoebox), minify atlas JSON, lazy-load audio via Howler.js, preload progress bar
- Audio rules: bắt đầu context sau first user gesture (Apple Safari autoplay policy) — `Howler.mute(false)` sau first pointerup/click
- Profile performance mỗi build mới: Chrome **Performance** + **Layers** panel, Three.js Inspector, Phaser Debug plugin; đo memory heap snapshot sau 10 phút chơi
- **State machines rõ ràng**: mỗi screen/game state là class riêng (Boot → Preloader → MainMenu → Playing → GameOver → Results) tránh boolean flags rối
- **Config-driven game balance**: mọi tham số (số lần sai tối đa, thời gian đếm ngược, số balloon mỗi màn, điểm thưởng…) lưu vào JSON / YAML file riêng, KHÔNG hardcode trong code logic
- Dùng **Web Worker** cho task nặng: pathfinding A*, MCTS AI opponent, audio processing, level generation — giữ main thread free cho render

### MUST NOT DO
- ❌ Tạo object mới (`new Class()`, `[]`, `{}`, template string nhiều lần) trong game loop `update()` mỗi frame → tăng GC pressure = stutter 50-200ms
- ❌ Bỏ qua iOS Safari / Android Chrome test; 70% user Việt Nam mở app trên mobile browser
- ❌ Gọi `console.log` trong update loop production → log I/O block main thread rất nặng
- ❌ Hardcode kích thước canvas 1920x1080; luôn dùng scale mode FIT / RESIZE với CSS aspect-ratio lock
- ❌ Dùng `setTimeout`/`setInterval` cho timing game — **luôn dùng `scene.time.delayedCall` (Phaser)** hoặc accumulator với delta time (setInterval không sync với V-Sync → drift)
- ❌ Load toàn bộ 500MB asset lúc boot; chia thành chunk theo level / game mode, preload progress theo từng chunk
- ❌ Bỏ qua touch-action CSS trên canvas: luôn `touch-action: none; user-select: none` → tránh native swipe back / zoom vô tình làm game bị gián đoạn
- ❌ So sánh string enums cho state transitions; dùng `as const` TypeScript + union type hoặc symbol

## Output Templates

When implementing game features, provide:
1. Core system implementation (ECS component, MonoBehaviour, or Actor)
2. Associated data structures (ScriptableObjects, structs, configs)
3. Performance considerations and optimizations
4. Brief explanation of architecture decisions

## Key Code Patterns (TypeScript — Web / Phaser / React)

### 1) Object Pool (Generic TypeScript, dùng cho sprite, card, balloon, particle)
```ts
/**
 * Object Pool GC-free — tránh new / destroy liên tục trong game loop.
 * TFactory = hàm tạo 1 instance mới; TReset = reset instance khi trả về pool.
 * Phù hợp: Phaser GameObjects, HTML div cards, balloon objects.
 */
export class ObjectPool<T>
{
  private readonly pool: T[] = [];
  private readonly factory: () => T;
  private readonly reset: (obj: T) => void;
  private readonly onGet?: (obj: T) => void;

  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize = 24,
    onGet?: (obj: T) => void,
  )
  {
    this.factory = factory;
    this.reset = reset;
    this.onGet = onGet;
    for (let i = 0; i < initialSize; i++) this.release(this.create());
  }

  get(): T
  {
    const obj = this.pool.length > 0 ? this.pool.pop()! : this.create();
    this.onGet?.(obj);
    return obj;
  }

  release(obj: T): void
  {
    this.reset(obj);
    this.pool.push(obj);
  }

  private create(): T { return this.factory(); }

  /** Đảm bảo pool đủ size, tránh spike allocation khi vào màn chơi lớn */
  prewarm(count: number): void
  {
    while (this.pool.length < count) this.pool.push(this.create());
  }
}
```

---

### 2) Typed Event Bus / Signal System (thay UnityEvents — cho cross-scene comms)
```ts
/**
 * Signal bus zero-dependency (không cần RxJS / Phaser Events riêng).
 * Cách dùng:
 *   const onScoreChanged = new Signal<number>();
 *   onScoreChanged.addListener( (newScore) => HUD.setScore(newScore) );
 *   onScoreChanged.dispatch(42);
 */
export type ListenerFn<T> = (payload: T) => void;

export class Signal<T = void>
{
  private readonly listeners = new Set<ListenerFn<T>>();

  addListener(fn: ListenerFn<T>, { once = false }: { once?: boolean } = {}): () => void
  {
    const wrapper = (p: T) =>
    {
      fn(p);
      if (once) this.listeners.delete(wrapper);
    };
    this.listeners.add(wrapper as ListenerFn<T>);
    // trả unsubscribe fn (React useEffect cleanup pattern)
    return () => this.listeners.delete(wrapper as ListenerFn<T>);
  }

  dispatch(payload: T): void
  {
    // Iterate bản sao Set để tránh lỗi listener dispatch lại dispatch
    for (const fn of Array.from(this.listeners)) fn(payload);
  }

  clear(): void { this.listeners.clear(); }
}
```

---

### 3) Finite State Machine (FSM) — Game Scene Manager (Boot → Menu → InGame → GameOver)
```ts
export interface GameState<TContext>
{
  readonly key: string;
  enter(ctx: TContext): void | Promise<void>;
  update?(ctx: TContext, deltaMs: number): void;
  exit(ctx: TContext): void | Promise<void>;
}

export class StateMachine<TContext>
{
  private current?: GameState<TContext>;

  constructor(private readonly ctx: TContext) {}

  get stateKey(): string | undefined { return this.current?.key; }

  async transitionTo(next: GameState<TContext>): Promise<void>
  {
    if (this.current?.key === next.key) return;
    await this.current?.exit(this.ctx);
    this.current = next;
    await this.current.enter(this.ctx);
  }

  /** Call mỗi frame (16ms @60fps) — deltaMs dùng accumulator physics */
  tick(deltaMs: number): void { this.current?.update?.(this.ctx, deltaMs); }
}

// ==== Usage với mini-game vocabulary matching ====
interface MatchCtx { scene: Phaser.Scene; score: number; lives: number; }

const MenuState: GameState<MatchCtx> = {
  key: 'MENU',
  enter: ({ scene }) => { scene.add.text(200, 200, '🎯 VOCAB MATCH - BẤM ĐỂ BẮT ĐẦU', { fontSize: '36px', color: '#fff' }); },
};
const PlayingState: GameState<MatchCtx> = {
  key: 'PLAYING',
  enter: () => { /* spawn card objects */ },
  update: (ctx, dt) => { /* logic check 2 card flipped, timer */ },
};
```

---

### 4) GC-Free Fixed Time-Step Game Loop (accumulator pattern)
```ts
/**
 * Fixed timestep = update logic đều đặn 60 tick/s (16.6ms mỗi tick),
 * độc lập với render frame rate (giúp physics deterministics, tránh jitter
 * trên màn hình 120Hz / 144Hz hoặc mobile drop frame).
 * Delta time dưới dạng ms -> convert sang seconds.
 */
type Updater = (fixedDeltaSec: number) => void;
type Renderer = (alpha: number) => void;

export function startGameLoop(update: Updater, render: Renderer, { tickHz = 60 }: { tickHz?: number } = {}) : () => void
{
  const STEP_MS = 1000 / tickHz; // ≈16.6ms ở 60 Hz
  const STEP_SEC = STEP_MS / 1000;
  let acc = 0;
  let lastTs = performance.now();
  let rafId = 0;
  let running = true;

  const frame = (nowMs: number): void =>
  {
    if (!running) return;
    let deltaMs = nowMs - lastTs;
    lastTs = nowMs;
    // clamp: nếu tab ở background lâu thì delta rất lớn → giới hạn 250ms tránh spiral of death
    if (deltaMs > 250) deltaMs = 250;

    acc += deltaMs;
    while (acc >= STEP_MS) { update(STEP_SEC); acc -= STEP_MS; }

    const alpha = acc / STEP_MS; // interpolation cho render mượt giữa 2 fixed update
    render(alpha);

    rafId = requestAnimationFrame(frame);
  };

  // Pause khi tab ẩn (tối ưu pin, ngăn freeze RAF)
  const onVis = () => { if (document.hidden) lastTs = performance.now(); };
  document.addEventListener('visibilitychange', onVis);

  rafId = requestAnimationFrame(frame);

  // Trả về hàm cleanup (dùng trong React useEffect cleanup hoặc scene shutdown)
  return () =>
  {
    running = false;
    cancelAnimationFrame(rafId);
    document.removeEventListener('visibilitychange', onVis);
  };
}
```

[Documentation Web Game Patterns (internal)](/docs/codebase-summary.md)
[Phaser 3 API](https://newdocs.phaser.io/docs/)
[Three.js / React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction)
