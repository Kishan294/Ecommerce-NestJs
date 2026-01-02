import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiTooManyRequestsResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler'; // <--- Import Throttle
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

/**
 * Controller responsible for handling authentication-related requests.
 * Includes user registration and login.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * Registers a new user in the system.
   * @param dto The registration data (email, password).
   * @returns The newly created user object (without password).
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'No links', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error).' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Authenticates a user and returns a JWT access token.
   * Uses the local strategy for initial validation.
   * @param req The request object containing the validated user.
   * @returns An object containing the access token.
   */
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access_token. No links', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized. No links' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts. Try again later. No links' })
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  // SECURITY: Only 3 login attempts per minute
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }
}