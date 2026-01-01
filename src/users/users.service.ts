import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from 'src/generated/prisma/client';
import bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    async comparePasswords(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    async create(data: Prisma.UserCreateInput) {
        try {
            return await this.prisma.user.create({ data });
        } catch (err: any) {
            if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
                throw new ConflictException('Email already exists');
            }
            throw err;
        }
    }

    async update(id: string, data: Prisma.UserUpdateInput) {
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

    async delete(id: string) {
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