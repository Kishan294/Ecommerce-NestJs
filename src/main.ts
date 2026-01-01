import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 1. Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 2. Security Headers (Helmet)
  app.use(helmet());

  // 3. Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('Production-grade E-commerce backend with NestJS, Prisma & UploadThing')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Products')
    .addTag('Categories')
    .addTag('Cart')
    .addTag('Orders')
    .addBearerAuth( // Enable JWT Button in Swagger UI
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Key to use in @ApiBearerAuth
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 4. Global Pipes & Interceptors & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // 5. CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Documentation: http://localhost:${port}/api`);
}
bootstrap();