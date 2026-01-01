import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { UploadthingService } from 'src/common/services/upload-thing.service';


@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      isGlobal: false,
      ttl: 60,
    }),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, UploadthingService],
  exports: [ProductsService],
})
export class ProductsModule { }