import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER || 'nestjs_user',
  password: process.env.POSTGRES_PASSWORD || 'nestjs_password',
  database: process.env.POSTGRES_DB || 'nestjs_db',
  
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
});