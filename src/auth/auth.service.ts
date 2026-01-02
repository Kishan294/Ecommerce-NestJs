import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../generated/prisma/client'; // adjust path
import { RegisterDto } from './dto/register.dto';

/**
 * Service handling authentication logic, including user validation,
 * JWT generation, and registration.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  /**
   * Validates a user's credentials.
   * @param email The user's email address.
   * @param password The user's plain-text password.
   * @returns The user object without the password hash if valid, null otherwise.
   */
  async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const valid = await this.usersService.comparePasswords(password, user.passwordHash);
    if (!valid) return null;

    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Generates a JWT token for a validated user.
   * @param user The user object (without password).
   * @returns An object containing the access token.
   */
  async login(user: Omit<User, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user and hashes their password.
   * @param dto The registration data.
   * @returns The newly created user object (safe version).
   * @throws ConflictException if the email is already registered.
   */
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.usersService.hashPassword(dto.password);

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      role: 'CUSTOMER',
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}