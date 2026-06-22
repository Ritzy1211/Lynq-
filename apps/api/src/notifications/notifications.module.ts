import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnv } from '../config/env.config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CHANNEL_REGISTRY, ChannelRegistry } from './providers/channel-registry';
import { LogNotificationProvider } from './providers/log.provider';
import { TermiiNotificationProvider } from './providers/termii.provider';
import { WhatsAppCloudProvider } from './providers/whatsapp.provider';

/**
 * All three providers are instantiated up-front; the service picks one (or
 * several, with fallback) per send based on `NOTIFICATIONS_CHANNELS`.
 *
 * Adding a new channel: implement `NotificationProvider`, register the
 * class here, and add the channel name to the env enum.
 */
@Module({
  controllers: [NotificationsController],
  providers: [
    LogNotificationProvider,
    TermiiNotificationProvider,
    WhatsAppCloudProvider,
    {
      provide: CHANNEL_REGISTRY,
      inject: [LogNotificationProvider, TermiiNotificationProvider, WhatsAppCloudProvider],
      useFactory: (
        log: LogNotificationProvider,
        termii: TermiiNotificationProvider,
        whatsapp: WhatsAppCloudProvider,
      ) => new ChannelRegistry([log, termii, whatsapp]),
    },
    {
      provide: 'NOTIFICATION_CHANNELS',
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnv, true>) =>
        config.get('NOTIFICATIONS_CHANNELS', { infer: true }),
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
