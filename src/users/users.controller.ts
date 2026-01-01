import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/generated/prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(AdminGuard)
    @Roles('admin')
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIdPipe) id: string): Promise<User | undefined> {
        return this.usersService.findOne(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        // NOTE: we’ll hash passwords properly in auth phase
        return this.usersService.create({
            email: createUserDto.email,
            passwordHash: 'TEMP_HASH', // TODO: replace with bcrypt
            role: createUserDto.role ?? UserRole.CUSTOMER,
        });
    }

    @Patch(':id')
    update(@Param('id', ParseIdPipe) id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param('id', ParseIdPipe) id: string): void {
        this.usersService.delete(id);
    }
}