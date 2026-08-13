const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { JwtService } = require('@nestjs/jwt');
const { getRepositoryToken } = require('@nestjs/typeorm');
const { User } = require('./dist/modules/auth/entities/user.entity');

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepo = app.get(getRepositoryToken(User));
  const adminUser = await userRepo.findOne({ where: { role: 'ADMIN' } });
  
  if (!adminUser) {
    console.error('No admin found');
    process.exit(1);
  }
  
  console.log('Found Admin:', adminUser.id);
  
  const jwt = app.get(JwtService);
  const token = jwt.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role });
  
  const res = await fetch('http://localhost:8000/api/v1/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  });
  
  console.log('STATUS:', res.status);
  const json = await res.json();
  console.log('RESPONSE:', json);
  
  process.exit(0);
}

test();
