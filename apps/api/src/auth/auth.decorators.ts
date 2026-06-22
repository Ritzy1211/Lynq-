import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { TenantClaims, UserRole } from '@lynq/types';

export const IS_PUBLIC_KEY = 'auth:isPublic';
export const ROLES_KEY = 'auth:roles';

/** Skip auth on a controller or handler. */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);

/** Restrict a handler to one or more roles. */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

/** Inject the authenticated tenant claims into a controller method parameter. */
export const CurrentTenant = createParamDecorator((_: unknown, ctx: ExecutionContext): TenantClaims => {
  const req = ctx.switchToHttp().getRequest<Request & { tenant?: TenantClaims }>();
  if (!req.tenant) {
    throw new Error('CurrentTenant decorator used on a route without AuthGuard');
  }
  return req.tenant;
});
