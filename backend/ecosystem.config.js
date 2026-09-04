module.exports = {
  apps: [
    {
      name: 'hanzi-srs-backend',
      script: 'dist/main.js',     // Đường dẫn đến file code đã compile của NestJS
      instances: 2,               // Chạy 2 instance
      exec_mode: 'cluster',       // Bật chế độ cluster để tận dụng đa nhân CPU
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
};
