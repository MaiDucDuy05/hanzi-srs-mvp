async function test() {
  try {
    const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@hanzi.local', password: 'password' }) 
    });
    console.log('Login Status:', loginRes.status);
    
    const cookie = loginRes.headers.get('set-cookie');
    
    const configsRes = await fetch('http://localhost:8000/api/v1/admin/configs', {
      headers: { 'Cookie': cookie || '' }
    });
    console.log('Configs Status:', configsRes.status);
    const body = await configsRes.text();
    console.log('Body:', body);
  } catch (e) {
    console.error(e);
  }
}
test();
