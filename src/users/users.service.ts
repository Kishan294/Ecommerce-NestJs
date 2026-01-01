import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from 'src/generated/prisma/client';


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        try {
            return await this.prisma.user.create({ data });
        } catch (err: any) {
            // Prisma unique constraint error code = P2002
            if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
                throw new ConflictException('Email already exists');
            }
            throw err;
        }
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        try {
            return await this.prisma.user.update({
                where: { id },
                data,
            });
        } catch (err: any) {
            if (err.code === 'P2025') {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            throw err;
        }
    }

    async delete(id: string): Promise<User> {
        try {
            return await this.prisma.user.delete({ where: { id } });
        } catch (err: any) {
            if (err.code === 'P2025') {
                throw new NotFoundException(`User with id ${id} not found`);
            }
            throw err;
        }
    }
}