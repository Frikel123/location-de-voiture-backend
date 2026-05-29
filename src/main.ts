import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));

  const frontendPublicUrl = process.env.FRONTEND_PUBLIC_URL;
  app.enableCors({
    origin: [
      'https://carsatlas.netlify.app',
      'http://localhost:5173',
      'http://localhost:8080',
      ...(frontendPublicUrl ? [frontendPublicUrl.replace(/\/$/, '')] : []),
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`API running on port ${port}`);
}

bootstrap();
