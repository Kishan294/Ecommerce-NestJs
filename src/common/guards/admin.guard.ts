import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

/**
 * Guard that checks if the user has the required roles.
 * Note: This implementation currently extracts role from headers, which is useful for testing.
 * In production, this should use the user object attached by the JwtAuthGuard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    /**
     * Determines if the current request is authorized based on user roles.
     * @param context Execution context.
     * @returns True if the user has the required roles or if no roles are required.
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // no roles required
        }

        const request = context.switchToHttp().getRequest();
        const roleFromHeader = request.headers['x-role'] as string | undefined;

        if (!roleFromHeader) {
            return false;
        }

        return requiredRoles.includes(roleFromHeader as Role);
    }
}