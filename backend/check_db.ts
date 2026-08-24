import { DataSource } from 'typeorm';

async function run() {
  const url = 'http://localhost:5000/api/v1/test-attempts/c03d85c9-2189-4ebc-92a0-6bc32144f045/answers';
  console.log('Sending request to', url);
  
  // We don't have a token, so this might throw 401 Unauthorized
  // Let's just login first to get a token!
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hocvien1@hanzi.dev', password: 'Test@1234' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data.accessToken;
  
  console.log('Got token:', token ? 'YES' : 'NO');
  
  // Now submit an answer (using any question_id from the DB)
  // Just use a random UUID for questionId to see if it says "Test question not found"
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      questionId: '0d12f2c9-ee73-4929-adf5-193e190e27bb', // From our previous query
      answer: 'test answer'
    })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

run().catch(console.error);
