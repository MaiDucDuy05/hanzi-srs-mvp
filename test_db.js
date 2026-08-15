const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'hanzi_user',
  password: 'hanzi_password',
  database: 'hanzi_srs',
});

dataSource.initialize().then(async () => {
  const result = await dataSource.query('SELECT * FROM system_configs');
  console.log(result);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
