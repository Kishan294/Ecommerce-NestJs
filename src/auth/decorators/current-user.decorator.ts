import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUserData = {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
};

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CurrentUserData;
  },
);