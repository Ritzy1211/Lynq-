import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import type { TenantClaims } from '@lynq/types';
import { CurrentTenant } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ReportsService } from './reports.service';

const EodQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
});

@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('eod')
  endOfDay(
    @CurrentTenant() tenant: TenantClaims,
    @Query(new ZodValidationPipe(EodQuerySchema)) query: z.infer<typeof EodQuerySchema>,
  ) {
    const date = query.date ?? todayLocalIso();
    return this.reports.endOfDay(tenant.tenantId, date);
  }
}

function todayLocalIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
