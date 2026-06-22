import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  async health(): Promise<{ status: 'ok' | 'degraded'; checks: Record<string, 'ok' | 'fail'> }> {
    const checks: Record<string, 'ok' | 'fail'> = { db: 'fail' };
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.db = 'ok';
    } catch {
      checks.db = 'fail';
    }
    const status = Object.values(checks).every((v) => v === 'ok') ? 'ok' : 'degraded';
    return { status, checks };
  }
}
