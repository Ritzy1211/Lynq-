import type { NotificationProvider } from './notification-provider';

/**
 * Channel registry. The dispatcher keeps providers keyed by their channel
 * name (`log`, `sms`, `whatsapp`) so the notifications service can pick the
 * right one based on the configured fallback list.
 */
export type ChannelName = 'log' | 'sms' | 'whatsapp';

export class ChannelRegistry {
  private readonly providers: Map<ChannelName, NotificationProvider>;

  constructor(providers: NotificationProvider[]) {
    this.providers = new Map();
    for (const p of providers) {
      this.providers.set(p.name as ChannelName, p);
    }
  }

  get(name: ChannelName): NotificationProvider | undefined {
    return this.providers.get(name);
  }

  has(name: ChannelName): boolean {
    return this.providers.has(name);
  }
}

export const CHANNEL_REGISTRY = Symbol('CHANNEL_REGISTRY');
