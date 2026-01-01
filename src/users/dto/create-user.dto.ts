import { IsEmail, IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from 'src/generated/prisma/enums';


export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsOptional()
    @IsEnum(['CUSTOMER', 'ADMIN'])
    role?: UserRole;
}