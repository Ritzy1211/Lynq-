/**
 * A notification provider sends a single message to a single recipient
 * and reports back enough information to update the `NotificationLog` row.
 *
 * Implementations MUST NOT throw on transport failure — return `{ ok: false }`
 * so the caller can persist the error and (optionally) retry later.
 */
export interface NotificationSendInput {
  /** E.164-ish phone (e.g. `+2348012345678`) or local format. */
  recipient: string;
  /** Human-readable text body. */
  message: string;
  /** Logical template id (e.g. `order_ready`). For logging/metrics only. */
  template: string;
}

export interface NotificationSendResult {
  ok: boolean;
  /** Provider's id for the outbound message (e.g. Termii message_id). */
  providerRef?: string;
  /** Channel actually used (`sms`, `whatsapp`, `log`, …). */
  channel: string;
  /** Error message when `ok` is false. */
  error?: string;
}

export interface NotificationProvider {
  readonly name: string;
  send(input: NotificationSendInput): Promise<NotificationSendResult>;
}

export const NOTIFICATION_PROVIDER = Symbol('NOTIFICATION_PROVIDER');
