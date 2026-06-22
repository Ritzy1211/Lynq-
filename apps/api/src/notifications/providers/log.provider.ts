import { Injectable, Logger } from '@nestjs/common';
import type {
  NotificationProvider,
  NotificationSendInput,
  NotificationSendResult,
} from './notification-provider';

/**
 * Fallback provider for dev and for shops that prefer to message customers
 * by hand. The "send" only writes to the server log; the row is still
 * persisted so staff can see the queue.
 */
@Injectable()
export class LogNotificationProvider implements NotificationProvider {
  readonly name = 'log';
  private readonly logger = new Logger(LogNotificationProvider.name);

  async send(input: NotificationSendInput): Promise<NotificationSendResult> {
    this.logger.log(`[${input.template}] -> ${input.recipient}: ${input.message}`);
    return {
      ok: true,
      channel: 'log',
      providerRef: `log-${Date.now()}`,
    };
  }
}
