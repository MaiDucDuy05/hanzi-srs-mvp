const autocannon = require('autocannon');

// Micro-benchmark 1 endpoint (autocannon). Cho load test đầy đủ (scenario/journey/threshold)
// dùng k6 — `npm run load:smoke`. Xem ARCHITECTURE.md.
//
// KHÔNG hardcode JWT: token expire + leak secret. Benchmark endpoint public, hoặc truyền
// cookie qua env: AUTOCANN_COOKIE=<jwt>.

const url = process.env.AUTOCANN_URL || 'http://localhost:8000/api/v1/courses';
const method = process.env.AUTOCANN_METHOD || 'GET';
const connections = Number(process.env.AUTOCANN_CONN) || 100;
const duration = Number(process.env.AUTOCANN_DUR) || 15;

const headers = { 'content-type': 'application/json', accept: '*/*' };
const cookie = process.env.AUTOCANN_COOKIE;
if (cookie) headers.cookie = `access_token=${cookie}`;

console.log(`🚀 Micro-benchmark → ${url} | ${connections} conn | ${duration}s`);

const instance = autocannon(
  { url, method: 'GET', connections, duration, headers },
  (err, r) => {
    if (err) return console.error('❌ Lỗi:', err);
    console.log('\n📊 KẾT QUẢ:');
    console.log('--------------------------------------------------');
    console.log(`🔌 Connections: ${r.connections}`);
    console.log(`⏱️  Duration: ${r.duration}s`);
    console.log(`📨 Total req: ${r.requests.total}`);
    console.log(`❌ Non-2xx: ${r.non2xx}`);
    console.log(`⏳ Latency avg: ${r.latency.average} ms`);
    console.log(`📈 Req/sec: ${r.requests.average}`);
    console.log('--------------------------------------------------');
  },
);

autocannon.track(instance, { renderProgressBar: true });
