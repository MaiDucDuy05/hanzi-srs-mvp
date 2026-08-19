async function test() {
  try {
    const configsRes = await fetch('http://localhost:8000/api/v1/admin/configs');
    console.log('Configs Status:', configsRes.status);
    const body = await configsRes.text();
    console.log('Body:', body);
  } catch (e) {
    console.error(e);
  }
}
test();
