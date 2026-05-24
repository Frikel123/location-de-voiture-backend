import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { ContractsModule } from './contracts/contracts.module';

const loadLocalEnv = () => {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadLocalEnv();

const getDatabaseConfig = (): TypeOrmModuleOptions => {
  return {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    autoLoadEntities: true,
    synchronize: true,
  };
};

@Module({
  imports: [
    TypeOrmModule.forRoot(getDatabaseConfig()),
    CarsModule,
    BookingsModule,
    AuthModule,
    ContractsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
