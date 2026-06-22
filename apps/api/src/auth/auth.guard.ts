import { CanActivate, ExecutionContext, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { TenantClaims, UserRole } from '@lynq/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AppEnv } from '../config/env.config';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorators';

interface JwtPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  branchIds?: string[];
}

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private devClaims: TenantClaims | null = null;

  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppEnv, true>,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.config.get('AUTH_MODE', { infer: true }) === 'dev') {
      await this.loadDevClaims();
    }
  }

  private async loadDevClaims(): Promise<void> {
    const slug = this.config.get('DEV_TENANT_SLUG', { infer: true });
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return; // Seed hasn't run yet; we'll retry per-request.
    const owner = await this.prisma.user.findFirst({
      where: { tenantId: tenant.id, role: 'owner' },
    });
    if (!owner) return;
    this.devClaims = {
      tenantId: tenant.id,
      userId: owner.id,
      role: 'owner',
      branchIds: [],
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();

    // Dev bypass: inject the default tenant + owner without requiring a token.
    if (this.config.get('AUTH_MODE', { infer: true }) === 'dev') {
      if (!this.devClaims) await this.loadDevClaims();
      if (!this.devClaims) {
        throw new UnauthorizedException(
          'Dev auth not initialized. Run `pnpm --filter @lynq/db seed` to create the default shop.',
        );
      }
      (req as Request & { tenant?: TenantClaims }).tenant = this.devClaims;
      return true;
    }

    const token = extractBearer(req);
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.tenantId || !payload.sub || !payload.role) {
      throw new UnauthorizedException('Token is missing required claims');
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(payload.role)) {
      throw new UnauthorizedException('Insufficient role');
    }

    const claims: TenantClaims = {
      tenantId: payload.tenantId,
      userId: payload.sub,
      role: payload.role,
      branchIds: payload.branchIds ?? [],
    };

    (req as Request & { tenant?: TenantClaims }).tenant = claims;
    return true;
  }
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null;
  return value;
}
