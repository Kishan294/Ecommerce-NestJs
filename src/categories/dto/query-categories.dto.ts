import { IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '../../common/dto/base-query.dto';

export class QueryCategoriesDto extends BaseQueryDto {
  @IsOptional()
  @IsString()
  parentId?: string; // filter by parent category
}