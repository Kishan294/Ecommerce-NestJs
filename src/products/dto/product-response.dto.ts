import { Decimal } from '@prisma/client/runtime/client';
import { Product } from '../../generated/prisma/client';

export class ProductResponseDto implements Omit<Product, 'categoryId'> {
  id!: string;
  title!: string;
  slug!: string;
  description!: string | null;
  price!: Decimal;
  stock!: number;
  sku!: string | null;
  categoryId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}