const { io } = require('socket.io-client');

// Live-quiz load test (socket.io). k6 không support socket.io native → Node script.
// Flow: M teacher host_game → N student chia đều join_game → start_game → submit_answer loop.
// Args: --students N (500) --rooms M (10) --duration S (30) --url URL (http://localhost:8000)

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (k, d) => {
    const i = a.indexOf(k);
    return i >= 0 ? a[i + 1] : d;
  };
  return {
    students: Number(get('--students', 500)),
    rooms: Number(get('--rooms', 10)),
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

// Tạo 5 câu hỏi (mỗi câu 10s = 50s tổng thời gian game)
const QUESTIONS = Array.from({ length: 5 }, (_, i) => ({ prompt: `Q${i + 1}`, answer: `a${i + 1}` }));
const metrics = { connectTimes: [], joinTimes: [], answerTimes: [], errors: 0, connected: 0, joined: 0, answered: 0 };

function connect(url) {
  return new Promise((resolve) => {
    const start = Date.now();
    const sock = io(`${url}/live-quiz`, { transports: ['websocket'], timeout: 10000 });
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
  console.log(`🚀 Live-quiz → ${args.url}/live-quiz | ${args.rooms} rooms | ${args.students} students | ${args.duration}s`);

  // 1) Teachers host games
  const teachers = [];
  const pins = [];
  for (let i = 0; i < args.rooms; i++) {
    const teacher = await connect(args.url);
    if (!teacher) continue;
    
    const pin = await new Promise((resolve) => {
      teacher.on('game_hosted', (d) => resolve(d.pin));
      teacher.emit('host_game', {
        testId: 'load-test', teacherId: `teacher-${i}`, questions: QUESTIONS,
        gameMode: 'MANUAL', questionTimeLimit: 10, leaderboardTimeLimit: 5,
      });
    });
    teachers.push(teacher);
    pins.push(pin);
  }

  if (pins.length === 0) {
    console.error('❌ Không tạo được phòng nào!');
    process.exit(1);
  }
  
  console.log(`🎮 Hosted ${pins.length} games. PINs: ${pins.slice(0, 5).join(', ')}${pins.length > 5 ? '...' : ''}`);

  // 2) Students connect + join (chia đều vào các phòng)
  const students = [];
  let joinedCount = 0;
  
  // Connect có delay nhỏ (10ms) để tránh TCP SYN Flood làm nghẽn OS network buffer khi spam 500 socket cùng 1 mili-giây
  console.log('🔌 Đang kết nối students (ramp-up)...');
  for (let i = 0; i < args.students; i++) {
    const s = await connect(args.url);
    if (!s) continue;
    
    const targetPin = pins[i % pins.length];
    
    const joinStart = Date.now();
    s.on('joined', (data) => {
      if (data.success) {
        metrics.joinTimes.push(Date.now() - joinStart);
        metrics.joined++;
      } else {
        // Chỉ log nếu không phải là lỗi rác
        if (joinedCount < args.students) console.log(`❌ Join failed for ${i}:`, data.message);
      }
      joinedCount++;
    });
    
    s.on('question_started', () => {
      // Giả lập thời gian con người đọc câu hỏi (từ 0.5s đến 4s)
      const humanReadingDelay = 500 + Math.random() * 3500;
      setTimeout(() => {
        const aStart = Date.now();
        s.emit('submit_answer', { pin: targetPin, isCorrect: Math.random() > 0.5 });
        s.once('answer_result', () => {
          metrics.answerTimes.push(Date.now() - aStart);
          metrics.answered++;
        });
      }, humanReadingDelay);
    });
    
    s.emit('join_game', { pin: targetPin, studentId: `stu-${i}`, studentName: `Student ${i}` });
    students.push(s);
    
    // Ngủ 10ms giữa mỗi người để giãn cách (1000 người mất ~10s để connect xong)
    await sleep(10);
  }

  // Chờ tất cả join (hoặc timeout 20s cho rộng rãi vì OS local mở 500 TCP sockets có thể bị trễ)
  const expected = students.length;
  await Promise.race([
    new Promise((r) => {
      const t = setInterval(() => {
        if (joinedCount >= expected) {
          clearInterval(t);
          r();
        }
      }, 100);
    }),
    sleep(20000),
  ]);

  // 3) Start + advance question (MANUAL: teacher next_question sau 10s mỗi câu)
  console.log('⚔️ Bắt đầu game trên tất cả các phòng...');
  teachers.forEach((teacher, i) => {
    const pin = pins[i];
    teacher.on('question_started', () => setTimeout(() => teacher.emit('next_question', { pin }), 10000));
    teacher.emit('start_game', { pin });
  });

  // 4) Chờ game_ended hoặc hết duration
  const endPromises = teachers.map(teacher => new Promise((r) => teacher.on('game_ended', r)));
  await Promise.race([Promise.all(endPromises), sleep(args.duration * 1000)]);

  // 5) Cleanup + report
  teachers.forEach((t) => t.disconnect());
  students.forEach((s) => s.disconnect());
  
  console.log('\n📊 KẾT QUẢ LIVE-QUIZ:');
  console.log('--------------------------------------------------');
  console.log(`🔌 Connected: ${metrics.connected}/${args.students + args.rooms}`);
  console.log(`✅ Joined: ${metrics.joined}`);
  console.log(`📨 Answered: ${metrics.answered}`);
  console.log(`❌ Errors: ${metrics.errors}`);
  console.log(`⏳ Connect avg/p95: ${avg(metrics.connectTimes)}/${p95(metrics.connectTimes)} ms`);
  console.log(`⏳ Join avg/p95: ${avg(metrics.joinTimes)}/${p95(metrics.joinTimes)} ms`);
  console.log(`⏳ Answer RT avg/p95: ${avg(metrics.answerTimes)}/${p95(metrics.answerTimes)} ms`);
  console.log('--------------------------------------------------');
}

run().catch((err) => console.error('❌ Lỗi:', err.message));
