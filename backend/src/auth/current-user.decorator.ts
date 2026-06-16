import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  userId: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return req.user;
  },
);
