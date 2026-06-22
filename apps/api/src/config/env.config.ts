import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  WEB_BASE_URL: z.string().url().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  /**
   * When `dev`, the API bypasses JWT auth and injects a default tenant + user
   * (see `DEV_TENANT_SLUG`). Useful for the single-shop workflow before we add
   * a real login screen. Use `jwt` in production.
   */
  AUTH_MODE: z.enum(['dev', 'jwt']).default('dev'),
  DEV_TENANT_SLUG: z.string().default('demo'),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),

  /**
   * Notification channels, in fallback order. The dispatcher tries the first
   * channel; on failure it moves to the next. Each attempt is stored as its
   * own `NotificationLog` row so staff can see what was tried.
   *
   * Supported values: `log`, `sms` (Termii), `whatsapp` (Meta Cloud API).
   * Examples:
   *   - `log`                 (default, dev)
   *   - `sms`                 (SMS only)
   *   - `whatsapp,sms`        (WhatsApp first, SMS fallback)
   *   - `whatsapp`            (WhatsApp only)
   */
  NOTIFICATIONS_CHANNELS: z
    .string()
    .default('log')
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    )
    .pipe(z.array(z.enum(['log', 'sms', 'whatsapp'])).min(1)),

  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().default('Lynq'),
  TERMII_BASE_URL: z.string().url().default('https://api.ng.termii.com'),

  /**
   * WhatsApp Cloud API (Meta).
   *
   * Setup: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
   * You need a Business Account, a Phone Number ID and a permanent System
   * User access token.
   *
   * `WHATSAPP_MODE`:
   *   - `text` (dev): free-form text body. Only delivers if the customer has
   *     messaged the business in the last 24h ("customer service window").
   *   - `template` (prod): pre-approved template with 4 body variables
   *     {{1}}=firstName, {{2}}=orderNumber, {{3}}=statusLabel, {{4}}=tail.
   */
  WHATSAPP_MODE: z.enum(['text', 'template']).default('text'),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_TEMPLATE_NAME: z.string().default('order_update'),
  WHATSAPP_TEMPLATE_LANGUAGE: z.string().default('en'),
  WHATSAPP_API_VERSION: z.string().default('v20.0'),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function loadEnv(raw: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
