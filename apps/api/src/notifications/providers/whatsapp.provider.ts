import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../../config/env.config';
import type {
  NotificationProvider,
  NotificationSendInput,
  NotificationSendResult,
} from './notification-provider';

interface WhatsAppResponse {
  messages?: Array<{ id: string }>;
  error?: { message?: string; code?: number; type?: string };
}

/**
 * Meta WhatsApp Cloud API provider.
 *
 * Endpoint: `POST https://graph.facebook.com/{version}/{phoneNumberId}/messages`
 * Auth:     `Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}`
 *
 * Two modes (controlled by `WHATSAPP_MODE`):
 *
 * 1. **text** (dev) — sends `{type:"text", text:{body}}`. This only delivers
 *    when the customer has messaged the business in the last 24h ("customer
 *    service window"). Outside that window WhatsApp rejects the send.
 *
 * 2. **template** (prod) — sends a pre-approved business template. The
 *    default template `order_update` is expected to have 4 body variables:
 *    `{{1}}` first name, `{{2}}` order number, `{{3}}` status label,
 *    `{{4}}` extra line (e.g. "See you soon!"). Create + approve the
 *    template in WhatsApp Manager before going live.
 */
@Injectable()
export class WhatsAppCloudProvider implements NotificationProvider {
  readonly name = 'whatsapp';
  private readonly logger = new Logger(WhatsAppCloudProvider.name);

  constructor(
    @Optional()
    @Inject(ConfigService)
    private readonly config?: ConfigService<AppEnv, true>,
  ) {}

  async send(input: NotificationSendInput): Promise<NotificationSendResult> {
    const token = this.config?.get('WHATSAPP_ACCESS_TOKEN', { infer: true });
    const phoneNumberId = this.config?.get('WHATSAPP_PHONE_NUMBER_ID', { infer: true });
    const version = this.config?.get('WHATSAPP_API_VERSION', { infer: true }) ?? 'v20.0';
    const mode = this.config?.get('WHATSAPP_MODE', { infer: true }) ?? 'text';
    const templateName =
      this.config?.get('WHATSAPP_TEMPLATE_NAME', { infer: true }) ?? 'order_update';
    const templateLang =
      this.config?.get('WHATSAPP_TEMPLATE_LANGUAGE', { infer: true }) ?? 'en';

    if (!token || !phoneNumberId) {
      return {
        ok: false,
        channel: 'whatsapp',
        error: 'WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID must be configured',
      };
    }

    const to = normalizeMsisdn(input.recipient);
    if (!to) {
      return {
        ok: false,
        channel: 'whatsapp',
        error: `Invalid recipient: ${input.recipient}`,
      };
    }

    const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;
    const body =
      mode === 'template'
        ? buildTemplateBody(to, templateName, templateLang, input)
        : buildTextBody(to, input.message);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      let parsed: WhatsAppResponse = {};
      try {
        parsed = text ? (JSON.parse(text) as WhatsAppResponse) : {};
      } catch {
        // non-JSON
      }

      if (!res.ok || !parsed.messages?.[0]?.id) {
        const err =
          parsed.error?.message ?? text ?? `HTTP ${res.status}`;
        this.logger.warn(`WhatsApp send failed: ${err}`);
        return { ok: false, channel: 'whatsapp', error: String(err).slice(0, 500) };
      }

      return {
        ok: true,
        channel: 'whatsapp',
        providerRef: parsed.messages[0].id,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`WhatsApp transport error: ${msg}`);
      return { ok: false, channel: 'whatsapp', error: msg.slice(0, 500) };
    }
  }
}

function buildTextBody(to: string, message: string) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: message },
  };
}

/**
 * Builds a `template` payload. We try to derive the four expected body
 * variables from the message body — the templates `{{1..4}}` slots map to:
 *
 *   1. first name (parsed from the message: "Hi {first},")
 *   2. order number (LYNQ-NNNN, regex-matched)
 *   3. status label (washed / ironed / ready / delivered / cancelled)
 *   4. tail (everything after the status sentence)
 *
 * Anything we can't derive falls back to a sensible placeholder so the
 * template variable substitution never fails.
 */
function buildTemplateBody(
  to: string,
  name: string,
  language: string,
  input: NotificationSendInput,
) {
  const { firstName, orderNumber, statusLabel, tail } = parseStandardMessage(
    input.message,
    input.template,
  );

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name,
      language: { code: language },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: firstName },
            { type: 'text', text: orderNumber },
            { type: 'text', text: statusLabel },
            { type: 'text', text: tail },
          ],
        },
      ],
    },
  };
}

function parseStandardMessage(message: string, template: string) {
  // Best-effort extraction; safe defaults if any pattern misses.
  const firstName = /^Hi\s+([^,]+),/i.exec(message)?.[1]?.trim() ?? 'there';
  const orderNumber = /LYNQ-\d+/.exec(message)?.[0] ?? '';
  const statusLabel = template.replace(/^order_/, '');
  // Tail = everything after the first sentence about the status.
  const tail =
    message.split('.').slice(1).join('.').trim() || 'We will keep you posted.';
  return { firstName, orderNumber, statusLabel, tail };
}

function normalizeMsisdn(raw: string, defaultCc = '234'): string | null {
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits.slice(1);
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('0')) return defaultCc + digits.slice(1);
  return digits;
}
