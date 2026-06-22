import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../config/env.config';
import type {
  NotificationProvider,
  NotificationSendInput,
  NotificationSendResult,
} from './notification-provider';

interface TermiiResponse {
  message_id?: string;
  message?: string;
  code?: string;
  balance?: number;
}

/**
 * Termii SMS provider.
 *
 * POST {baseUrl}/api/sms/send
 * { to, from, sms, type:"plain", channel:"generic", api_key }
 *
 * Termii returns 200 on accepted messages with a `message_id`. Anything else
 * is mapped to `{ ok: false, error }` so the caller can persist + retry.
 *
 * Phone normalization: Termii expects MSISDN without `+`. We trim spaces,
 * convert leading `0` to country code `234` (Nigeria default) and strip a
 * leading `+`.
 */
@Injectable()
export class TermiiNotificationProvider implements NotificationProvider {
  readonly name = 'sms';
  private readonly logger = new Logger(TermiiNotificationProvider.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    private readonly config?: ConfigService<AppEnv, true>,
  ) {}

  async send(input: NotificationSendInput): Promise<NotificationSendResult> {
    const apiKey = this.config?.get('TERMII_API_KEY', { infer: true });
    const sender = this.config?.get('TERMII_SENDER_ID', { infer: true }) ?? 'Lynq';
    const baseUrl =
      this.config?.get('TERMII_BASE_URL', { infer: true }) ?? 'https://api.ng.termii.com';

    if (!apiKey) {
      return {
        ok: false,
        channel: 'sms',
        error: 'TERMII_API_KEY is not configured',
      };
    }

    const to = normalizeMsisdn(input.recipient);
    if (!to) {
      return { ok: false, channel: 'sms', error: `Invalid recipient: ${input.recipient}` };
    }

    try {
      const res = await fetch(`${baseUrl}/api/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          from: sender,
          sms: input.message,
          type: 'plain',
          channel: 'generic',
          api_key: apiKey,
        }),
      });

      const text = await res.text();
      let body: TermiiResponse = {};
      try {
        body = text ? (JSON.parse(text) as TermiiResponse) : {};
      } catch {
        // non-JSON response — keep raw for the error message
      }

      if (!res.ok || !body.message_id) {
        const err = body.message ?? text ?? `HTTP ${res.status}`;
        this.logger.warn(`Termii send failed: ${err}`);
        return { ok: false, channel: 'sms', error: String(err).slice(0, 500) };
      }

      return { ok: true, channel: 'sms', providerRef: body.message_id };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Termii transport error: ${msg}`);
      return { ok: false, channel: 'sms', error: msg.slice(0, 500) };
    }
  }
}

function normalizeMsisdn(raw: string, defaultCc = '234'): string | null {
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits.slice(1);
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return defaultCc + digits.slice(1);
  return digits;
}
