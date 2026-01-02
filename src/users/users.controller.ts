import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type CurrentUserData } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../auth/dto/user-response.dto';

/**
 * Controller for managing user profiles and listing users.
 * Requires authentication and appropriate roles for certain endpoints.
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Retrieves the profile of the currently authenticated user.
     * @param user The current user data from the JWT.
     * @returns The user's profile information.
     */
    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Return profile.', type: UserResponseDto })
    getMe(@CurrentUser() user: CurrentUserData) {
        return this.usersService.findById(user.userId);
    }

    /**
     * Retrieves a list of all registered users. (Admin only)
     * @returns A list of users.
     */
    @Get()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'List all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Return user list.', type: [UserResponseDto] })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    findAll() {
        return this.usersService.findAll();
    }
}