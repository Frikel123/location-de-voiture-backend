import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './database.config';
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
