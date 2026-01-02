import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * The bootstrap function starts the NestJS application.
 * It configures logging, security headers (Helmet), CORS, Swagger documentation,
 * global pipes, interceptors, and filters.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 1. Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // 2. Helmet (Security Headers)
  // Content Security Policy is strict by default in v7, but defaults might block Swagger UI.
  // We customize it to allow inline scripts for Swagger.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"], // Only allow resources from this origin
          imgSrc: ["'", "'self'", "data:", "https:"], // Allow images and Swagger
          scriptSrc: ["'", "'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
          styleSrc: ["'", "'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        },
      },
    }),
  );

  // 3. CORS (Restrict to specific frontend)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true, // If using cookies
  });

  // 4. Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('Production-grade E-commerce backend with NestJS & Prisma')
    .setVersion('1.0')
    .addTag('Auth')
    .addTag('Products')
    .addTag('Categories')
    .addTag('Cart')
    .addTag('Orders')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 5. Global Config
  // app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  // 6. Global Pipes & Interceptors & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // <--- SECURITY: Removes extra fields
      forbidNonWhitelisted: true, // <--- SECURITY: Throws error if extra fields exist
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Documentation: http://localhost:${port}/docs`);
}
bootstrap();