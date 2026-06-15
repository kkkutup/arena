import { Global, Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const logger = new Logger('Redis');
        const client = new Redis(config.getOrThrow<string>('REDIS_URL'), {
          // null is required for BullMQ workers we add later; harmless otherwise.
          maxRetriesPerRequest: null,
          lazyConnect: false,
        });
        client.on('connect', () => logger.log('Redis connected'));
        client.on('error', (err) =>
          logger.error(`Redis error: ${err.message}`),
        );
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
