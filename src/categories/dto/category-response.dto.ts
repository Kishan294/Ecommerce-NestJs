import { Category } from '../../generated/prisma/client';

export class CategoryResponseDto implements Omit<Category, 'parentId'> {
  id!: string;
  name!: string;
  slug!: string;
  createdAt!: Date;
  updatedAt!: Date;
}