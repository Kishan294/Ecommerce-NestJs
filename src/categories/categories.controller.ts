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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Controller for managing product categories.
 * Provides endpoints for listing, viewing, creating, updating, and deleting categories.
 */
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  /**
   * Retrieves a paginated list of categories.
   * @param query Filtering and pagination parameters.
   * @returns A paginated list of categories.
   */
  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({ status: 200, description: 'Return categories.' })
  list(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.list(query);
  }

  /**
   * Retrieves a single category by its unique identifier.
   * @param id The ID of the category.
   * @returns The category details.
   * @throws NotFoundException if the category is not found.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single category' })
  @ApiResponse({ status: 200, description: 'Return category.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  /**
   * Creates a new category. (Admin only)
   * @param dto The category data.
   * @returns The newly created category.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /**
   * Updates an existing category. (Admin only)
   * @param id The ID of the category to update.
   * @param dto The updated data.
   * @returns The updated category.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /**
   * Deletes a category. (Admin only)
   * @param id The ID of the category to delete.
   * @returns A promise that resolves when the category is deleted.
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete category (Admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted.' })
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}