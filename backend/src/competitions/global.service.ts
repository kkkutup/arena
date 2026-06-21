import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CompetitionsService } from './competitions.service';

// The single recurring, global weekly trading competition (the "Gold Division").
// Runs Monday 00:00 UTC → Saturday 00:00 UTC (5 trading days), then the weekend
// shows that week's winners; a fresh round auto-starts the next Monday.
const STARTING_BALANCE = 5000;
const MAX_LEVERAGE = 10;
const CODE_PREFIX = 'GLOBAL-';
const RESET_FLAG = 'globalCompetitionsResetAt';

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
// Monday 00:00 UTC of the week containing `now`.
function mondayOf(now: Date): Date {
  const since = (now.getUTCDay() + 6) % 7; // days since Monday (Sun=0 → 6)
  return addDays(startOfUtcDay(now), -since);
}
// ISO-ish week label, e.g. "2026-W25", derived from the week's Monday.
function weekCode(monday: Date): string {
  const thursday = addDays(monday, 3); // Thursday decides the ISO year
  const year = thursday.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil((((thursday.getTime() - jan1.getTime()) / 86_400_000) + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export interface Winner {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  equity: number;
  returnPct: number;
}

@Injectable()
export class GlobalCompetitionService implements OnModuleInit {
  private readonly logger = new Logger(GlobalCompetitionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly comps: CompetitionsService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.resetOnce();
      await this.ensureWeek();
    } catch (e) {
      this.logger.error(`Global init failed: ${String(e)}`);
    }
  }

  // One-time clean slate: close every running competition that existed before
  // the global system shipped. Guarded by a Setting flag → runs exactly once.
  private async resetOnce(): Promise<void> {
    const flag = await this.prisma.setting.findUnique({ where: { key: RESET_FLAG } });
    if (flag) return;
    const res = await this.prisma.competition.updateMany({
      where: { status: { in: ['SCHEDULED', 'LIVE', 'SETTLING'] } },
      data: { status: 'FINISHED' },
    });
    await this.prisma.setting.create({
      data: { key: RESET_FLAG, value: new Date().toISOString() },
    });
    this.logger.log(`Global reset: closed ${res.count} running competitions`);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async tick(): Promise<void> {
    try {
      await this.ensureWeek();
    } catch (e) {
      this.logger.error(`ensureWeek failed: ${String(e)}`);
    }
  }

  // Make sure this week's global competition exists (only during Mon→Sat).
  async ensureWeek(): Promise<void> {
    const now = new Date();
    const monday = mondayOf(now);
    const saturday = addDays(monday, 5);
    if (now < monday || now >= saturday) return; // weekend → no active round

    const code = `${CODE_PREFIX}${weekCode(monday)}`;
    const existing = await this.prisma.competition.findUnique({ where: { joinCode: code } });
    if (existing) return;

    const instruments = (
      await this.prisma.instrument.findMany({
        where: { enabled: true },
        select: { symbol: true },
        orderBy: { sortOrder: 'asc' },
      })
    ).map((i) => i.symbol);

    await this.prisma.competition.create({
      data: {
        name: `Global Arena · ${weekCode(monday)}`,
        type: 'PUBLIC_DIVISION',
        instruments,
        startingBalance: STARTING_BALANCE,
        maxLeverage: MAX_LEVERAGE,
        joinCode: code,
        status: 'LIVE',
        startAt: monday,
        endAt: saturday,
      },
    });
    this.logger.log(`Created global competition ${code} (${instruments.length} instruments)`);
  }

  // The card payload: current round + phase + join status + winners.
  async current(userId: string) {
    await this.ensureWeek().catch(() => undefined);

    const now = new Date();
    const monday = mondayOf(now);
    const nextMonday = addDays(monday, 7);

    const comp = await this.prisma.competition.findFirst({
      where: { joinCode: { startsWith: CODE_PREFIX } },
      orderBy: { startAt: 'desc' },
    });
    if (!comp) {
      return { exists: false, phase: 'results' as const, nextStartAt: nextMonday };
    }

    const detail = await this.comps.detail(userId, comp.id);
    const live = comp.status === 'LIVE' && now < comp.endAt;

    let winners: Winner[];
    if (comp.status === 'FINISHED') {
      // Frozen final standings for the weekend results view.
      const parts = await this.prisma.participation.findMany({
        where: { competitionId: comp.id, finalRank: { not: null } },
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        orderBy: { finalRank: 'asc' },
        take: 5,
      });
      winners = parts.map((p) => ({
        rank: p.finalRank as number,
        userId: p.user.id,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl,
        equity: p.finalEquity ?? comp.startingBalance,
        returnPct:
          (((p.finalEquity ?? comp.startingBalance) - comp.startingBalance) /
            comp.startingBalance) *
          100,
      }));
    } else {
      winners = (await this.comps.leaderboardRows(comp.id)).slice(0, 5);
    }

    const part = await this.prisma.participation.findUnique({
      where: { competitionId_userId: { competitionId: comp.id, userId } },
    });

    return {
      exists: true,
      ...detail,
      phase: live ? ('live' as const) : ('results' as const),
      joined: !!part,
      winners,
      nextStartAt: live ? null : nextMonday,
    };
  }
}
