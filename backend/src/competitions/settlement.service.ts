import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CompetitionsService } from './competitions.service';

// Ends competitions that have passed their endAt: freezes the final leaderboard,
// records each player's finalRank/finalEquity, bumps competitionsPlayed for all
// and wins for #1. This is what makes the wins board real.
@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly comps: CompetitionsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async settleDue(): Promise<void> {
    const due = await this.prisma.competition.findMany({
      where: { status: 'LIVE', endAt: { lt: new Date() } },
      select: { id: true },
    });
    for (const c of due) await this.settleOne(c.id);
  }

  private async settleOne(competitionId: string): Promise<void> {
    // Claim it (LIVE -> SETTLING) so overlapping ticks can't double-settle.
    const claim = await this.prisma.competition.updateMany({
      where: { id: competitionId, status: 'LIVE' },
      data: { status: 'SETTLING' },
    });
    if (claim.count === 0) return;

    const rows = await this.comps.leaderboardRows(competitionId);
    const parts = await this.prisma.participation.findMany({
      where: { competitionId },
      select: { id: true, userId: true },
    });
    const partByUser = new Map(parts.map((p) => [p.userId, p.id]));

    const ops: Prisma.PrismaPromise<unknown>[] = [];
    for (const r of rows) {
      const pid = partByUser.get(r.userId);
      if (!pid) continue;
      ops.push(
        this.prisma.participation.update({
          where: { id: pid },
          data: { finalRank: r.rank, finalEquity: r.equity },
        }),
      );
      ops.push(
        this.prisma.profileStats.update({
          where: { userId: r.userId },
          data: {
            competitionsPlayed: { increment: 1 },
            ...(r.rank === 1 ? { wins: { increment: 1 } } : {}),
          },
        }),
      );
    }
    ops.push(
      this.prisma.competition.update({
        where: { id: competitionId },
        data: { status: 'FINISHED' },
      }),
    );
    await this.prisma.$transaction(ops);
    this.logger.log(
      `Settled competition ${competitionId} (${rows.length} players)`,
    );
  }
}
