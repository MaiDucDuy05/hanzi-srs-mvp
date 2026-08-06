import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * DataSource dùng cho TypeORM CLI migration/seed (không qua NestJS DI).
 * Đọc config từ .env qua dotenv.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false, // luôn tắt; schema quản lý bằng migration
  logging: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
