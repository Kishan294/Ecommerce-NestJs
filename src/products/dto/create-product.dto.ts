import { IsString, IsNumber, IsNotEmpty, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'wireless-mouse', description: 'URL friendly slug' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ required: false, example: 'Ergonomic design...' })
  @IsString()
  description?: string;

  @ApiProperty({ example: 29.99, description: 'Price in USD' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 50, description: 'Available quantity' })
  @IsNumber()
  @Min(0)
  stock!: number;

  @ApiProperty({ required: false, example: 'WM-001' })
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Category ID to link product to' })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}