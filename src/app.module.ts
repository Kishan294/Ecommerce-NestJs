import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { LoggerModule } from './logger/logger.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AppConfigModule, LoggerModule, UsersModule, PrismaModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }