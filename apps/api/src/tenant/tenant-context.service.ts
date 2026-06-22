import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import type { TenantClaims } from '@lynq/types';

/**
 * Request-scoped accessor for the authenticated tenant claims attached by
 * `AuthGuard`. Inject this anywhere a service needs the current tenant.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly req: Request) {}

  current(): TenantClaims | undefined {
    return (this.req as Request & { tenant?: TenantClaims }).tenant;
  }

  require(): TenantClaims {
    const claims = this.current();
    if (!claims) {
      throw new Error('TenantContextService.require() called without an authenticated tenant');
    }
    return claims;
  }
}
