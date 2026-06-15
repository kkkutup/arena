import { Controller, Get, Inject, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS } from '../redis/redis.module';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  // Liveness: process is up. Used by orchestrators; no external deps.
  @Get('live')
  live(): { status: string } {
    return { status: 'ok' };
  }

  // Readiness: can we actually serve (DB + Redis reachable)?
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => {
        const ind = this.indicator.check('database');
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return ind.up();
        } catch (e) {
          return ind.down({ message: (e as Error).message });
        }
      },
      async () => {
        const ind = this.indicator.check('redis');
        try {
          const pong = await this.redis.ping();
          return pong === 'PONG' ? ind.up() : ind.down();
        } catch (e) {
          return ind.down({ message: (e as Error).message });
        }
      },
    ]);
  }
}
