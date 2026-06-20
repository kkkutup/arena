import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Metric = 'xp' | 'wins';

type StatsWithUser = {
  xp: number;
  level: number;
  wins: number;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

const USER_SELECT = {
  user: {
    select: { id: true, username: true, displayName: true, avatarUrl: true },
  },
} as const;

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  async board(userId: string, metricRaw?: string) {
    const metric: Metric = metricRaw === 'wins' ? 'wins' : 'xp';
    const orderBy =
      metric === 'wins'
        ? [{ wins: 'desc' as const }, { xp: 'desc' as const }]
        : [{ xp: 'desc' as const }];

    const top = await this.prisma.profileStats.findMany({
      include: USER_SELECT,
      orderBy,
      take: 50,
    });
    const rows = top.map((s, i) => this.row(i + 1, s, userId));

    // The viewer's own row, with a true rank even if they're outside the top 50.
    let me = rows.find((r) => r.isMe) ?? null;
    if (!me) {
      const mine = await this.prisma.profileStats.findUnique({
        where: { userId },
        include: USER_SELECT,
      });
      if (mine) {
        const above =
          metric === 'wins'
            ? await this.prisma.profileStats.count({
                where: {
                  OR: [
                    { wins: { gt: mine.wins } },
                    { wins: mine.wins, xp: { gt: mine.xp } },
                  ],
                },
              })
            : await this.prisma.profileStats.count({
                where: { xp: { gt: mine.xp } },
              });
        me = this.row(above + 1, mine, userId);
      }
    }
    return { metric, rows, me };
  }

  private row(rank: number, s: StatsWithUser, userId: string) {
    return {
      rank,
      userId: s.user.id,
      username: s.user.username,
      displayName: s.user.displayName ?? s.user.username,
      avatarUrl: s.user.avatarUrl,
      xp: s.xp,
      level: s.level,
      wins: s.wins,
      isMe: s.user.id === userId,
    };
  }
}
