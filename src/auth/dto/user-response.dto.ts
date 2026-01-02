import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'clv1234567890', description: 'Unique identifier of the user' })
  id!: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email!: string;

  @ApiProperty({ example: 'CUSTOMER', description: 'User role', enum: ['CUSTOMER', 'ADMIN'] })
  role!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
