const { io } = require('socket.io-client');

// Live-quiz load test (socket.io). k6 không support socket.io native → Node script.
// Flow: 1 teacher host_game → N student join_game → start_game → submit_answer loop (MANUAL).
// Args: --students N (50) --duration S (30) --url URL (http://localhost:8000)

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (k, d) => {
    const i = a.indexOf(k);
    return i >= 0 ? a[i + 1] : d;
  };
  return {
    students: Number(get('--students', 50)),
    duration: Number(get('--duration', 30)),
    url: get('--url', 'http://localhost:8000'),
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, x) => s + x, 0) / arr.length) : 0);
function p95(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length * 0.95)] ?? s[s.length - 1];
}

const args = parseArgs();
const QUESTIONS = Array.from({ length: 5 }, (_, i) => ({ prompt: `Q${i + 1}`, answer: `a${i + 1}` }));
const metrics = { connectTimes: [], joinTimes: [], answerTimes: [], errors: 0, connected: 0, joined: 0, answered: 0 };

function connect(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const sock = io(`${url}/live-quiz`, { transports: ['websocket'], timeout: 5000 });
    sock.on('connect', () => {
      metrics.connectTimes.push(Date.now() - start);
      metrics.connected++;
      resolve(sock);
    });
    sock.on('connect_error', () => {
      metrics.errors++;
      sock.close();
      resolve(null);
    });
  });
}

async function run() {
  console.log(`🚀 Live-quiz → ${args.url}/live-quiz | ${args.students} students | ${args.duration}s`);

  // 1) Teacher host game
  const teacher = await connect(args.url);
  if (!teacher) {
    console.error('❌ Teacher connect fail — backend chạy :8000?');
    process.exit(1);
  }
  const pin = await new Promise((resolve) => {
    teacher.on('game_hosted', (d) => resolve(d.pin));
    teacher.emit('host_game', {
      testId: 'load-test', teacherId: 'teacher-1', questions: QUESTIONS,
      gameMode: 'MANUAL', questionTimeLimit: 10, leaderboardTimeLimit: 5,
    });
  });
  console.log(`🎮 Game hosted, PIN: ${pin}`);

  // 2) Students connect + join
  const students = [];
  let joinedCount = 0;
  for (let i = 0; i < args.students; i++) {
    const s = await connect(args.url);
    if (!s) continue;
    const joinStart = Date.now();
    s.on('joined', (data) => {
      if (data.success) {
        metrics.joinTimes.push(Date.now() - joinStart);
        metrics.joined++;
      }
      joinedCount++;
    });
    s.on('question_started', () => {
      const aStart = Date.now();
      s.emit('submit_answer', { pin, isCorrect: Math.random() > 0.5 });
      s.once('answer_result', () => {
        metrics.answerTimes.push(Date.now() - aStart);
        metrics.answered++;
      });
    });
    s.emit('join_game', { pin, studentId: `stu-${i}`, studentName: `Student ${i}` });
    students.push(s);
  }

  // Chờ tất cả join (hoặc timeout 5s)
  const expected = students.length;
  await Promise.race([
    new Promise((r) => {
      const t = setInterval(() => {
        if (joinedCount >= expected) {
          clearInterval(t);
          r();
        }
      }, 50);
    }),
    sleep(5000),
  ]);

  // 3) Start + advance question (MANUAL: teacher next_question sau 2s mỗi câu)
  teacher.on('question_started', () => setTimeout(() => teacher.emit('next_question', { pin }), 2000));
  teacher.emit('start_game', { pin });

  // 4) Chờ game_ended hoặc hết duration
  await Promise.race([new Promise((r) => teacher.on('game_ended', r)), sleep(args.duration * 1000)]);

  // 5) Cleanup + report
  teacher.disconnect();
  students.forEach((s) => s && s.disconnect());
  console.log('\n📊 KẾT QUẢ LIVE-QUIZ:');
  console.log('--------------------------------------------------');
  console.log(`🔌 Connected: ${metrics.connected}/${args.students + 1}`);
  console.log(`✅ Joined: ${metrics.joined}`);
  console.log(`📨 Answered: ${metrics.answered}`);
  console.log(`❌ Errors: ${metrics.errors}`);
  console.log(`⏳ Connect avg/p95: ${avg(metrics.connectTimes)}/${p95(metrics.connectTimes)} ms`);
  console.log(`⏳ Join avg/p95: ${avg(metrics.joinTimes)}/${p95(metrics.joinTimes)} ms`);
  console.log(`⏳ Answer RT avg/p95: ${avg(metrics.answerTimes)}/${p95(metrics.answerTimes)} ms`);
  console.log('--------------------------------------------------');
}

run().catch((err) => console.error('❌ Lỗi:', err.message));
