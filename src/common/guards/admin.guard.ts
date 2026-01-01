import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

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