import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Inject,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';

import { multerMemoryOptions } from '../common/utils/multer-memory.util';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UploadthingService } from 'src/common/services/upload-thing.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { ImageFileTypeValidator } from './validator/image-validator';

/**
 * Controller for managing products.
 * Provides endpoints for listing, viewing, creating, updating, and deleting products.
 */
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService,
    private readonly uploadthingService: UploadthingService) { }

  /**
   * Retrieves a paginated list of products based on query filters.
   * @param query Filters, sorting, and pagination parameters.
   * @returns A paginated list of products.
   */
  @Get()
  @ApiOperation({ summary: 'Get all products with filters, pagination, and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated products.' })
  list(@Query() query: QueryProductsDto) {
    return this.productsService.list(query);
  }

  /**
   * Retrieves a single product by its unique identifier.
   * @param id The ID of the product.
   * @returns The product details.
   * @throws NotFoundException if the product does not exist.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({ status: 200, description: 'Product details.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * Creates a new product. (Admin only)
   * @param dto The product data.
   * @returns The newly created product.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product created.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Requires Admin role).' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  /**
   * Updates an existing product. (Admin only)
   * @param id The ID of the product to update.
   * @param dto The updated data.
   * @returns The updated product.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /**
   * Deletes a product. (Admin only)
   * @param id The ID of the product to delete.
   * @returns A promise that resolves when the product is deleted.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted.' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  /**
   * Uploads an image for a specific product using UploadThing. (Admin only)
   * @param id The ID of the product.
   * @param file The image file to upload.
   * @returns The updated product with the new image URL.
   */
  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload product image via UploadThing' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded and URL updated.' })
  @ApiBody({
    type: UploadImageDto,
  })
  @UseInterceptors(FileInterceptor('file', multerMemoryOptions))
  async uploadProductImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new ImageFileTypeValidator(),
        ],
        exceptionFactory: (error) => new BadRequestException(error),
      }),
    )
    file: Express.Multer.File,

  ) {
    const uploadResult = await this.uploadthingService.uploadFile(file);
    const imageUrl = uploadResult.data?.ufsUrl!;
    return this.productsService.updateImageUrl(id, imageUrl);
  }
}