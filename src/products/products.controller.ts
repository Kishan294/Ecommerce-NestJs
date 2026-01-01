import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Inject,
  BadRequestException,
  Get,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer'; // <--- Import memoryStorage
import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'; // <--- Import your preferred validators
import { ProductsService } from './products.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UploadthingService } from 'src/common/services/upload-thing.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get()
  list(@Query() query: QueryProductsDto) {
    return this.productsService.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload product image via UploadThing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a product image',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // <--- Use memory storage explicitly
    }),
  )
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/ }), // Regex to allow common images
        ],
        exceptionFactory: (error) => new BadRequestException(error),
      }),
    )
    file: Express.Multer.File,
    @Inject(UploadthingService) uploadthingService: UploadthingService,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // 1. Upload to UploadThing
    const uploadResult = await uploadthingService.uploadFile(file);

    // 2. Extract URL (Note: UploadThing SDK might return result.data.url or result.url)
    const imageUrl = uploadResult.data?.ufsUrl!;

    // 3. Update Product in DB
    return this.productsService.updateImageUrl(id, imageUrl);
  }

}