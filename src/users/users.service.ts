import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from 'src/generated/prisma/client';
import bcrypt from 'bcryptjs';


/**
 * Service for managing user-related data and authentication security tasks.
 * Includes methods for finding users, hashing passwords, and CRUD operations.
 */
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Retrieves all users without their password hashes.
     * @returns A list of users.
     */
    async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Finds a single user by their ID.
     * @param id The ID of the user.
     * @returns The user record (without password hash).
     * @throws NotFoundException if the user doesn't exist.
     */
    async findById(id: string): Promise<Omit<User, 'passwordHash'>> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException(`User with id ${id} not found`);
        }
        return user;
    }

    /**
     * Finds a single user by their email address.
     * @param email The email address to look up.
     * @returns The user record or null if not found.
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    /**
     * Hashes a plain-text password using bcrypt.
     * @param password The plain-text password.
     * @returns The hashed password.
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Compares a plain-text password with a hashed version.
     * @param password The plain-text password.
     * @param hash The hashed password.
     * @returns True if they match, false otherwise.
     */
    async comparePasswords(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Creates a new user in the database.
     * @param data The user creation data.
     * @returns The newly created user.
     * @throws ConflictException if the email already exists.
     */
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

    /**
     * Updates an existing user's record.
     * @param id The ID of the user to update.
     * @param data The updated data.
     * @returns The updated user.
     * @throws NotFoundException if the user doesn't exist.
     */
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

    /**
     * Deletes a user from the database.
     * @param id The ID of the user to delete.
     * @returns The deleted user record.
     * @throws NotFoundException if the user doesn't exist.
     */
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