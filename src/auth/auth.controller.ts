import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiTooManyRequestsResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler'; // <--- Import Throttle
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation Error).' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access_token.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts. Try again later.' })
  @ApiBody({ type: LoginDto })
  @UseGuards(AuthGuard('local'))
  // SECURITY: Only 3 login attempts per minute
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }
}