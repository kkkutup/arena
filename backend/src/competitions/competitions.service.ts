import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { unrealizedPnl, type Side } from '../trading/engine';
import type { CreateCompetitionDto } from './dto';

function genCode(): string {
  return randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

interface PosLite {
  symbol: string;
  side: string;
  qty: number;
  entryPrice: number;
}

@Injectable()
export class CompetitionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly market: MarketService,
  ) {}

  private equityOf(cashBalance: number, positions: PosLite[]): number {
    const prices = this.market.getPrices();
    let unreal = 0;
    for (const p of positions) {
      const mark = prices[p.symbol] ?? p.entryPrice;
      unreal += unrealizedPnl(p.side as Side, p.qty, p.entryPrice, mark);
    }
    return cashBalance + unreal;
  }

  async create(userId: string, dto: CreateCompetitionDto) {
    const isPrivate = dto.type !== 'PUBLIC_DIVISION';
    const comp = await this.prisma.competition.create({
      data: {
        name: dto.name,
        type: dto.type,
        creatorId: userId,
        instruments: dto.instruments,
        startingBalance: dto.startingBalance,
        maxLeverage: dto.maxLeverage,
        joinCode: isPrivate ? genCode() : null,
        status: 'LIVE',
        startAt: new Date(),
        endAt: new Date(Date.now() + dto.durationHours * 3_600_000),
        participations: { create: { userId, cashBalance: dto.startingBalance } },
      },
    });
    return this.detail(userId, comp.id);
  }

  async joinByCode(userId: string, code: string) {
    const comp = await this.prisma.competition.findUnique({
      where: { joinCode: code.toUpperCase() },
    });
    if (!comp) throw new NotFoundException('No competition with that code');
    return this.join(userId, comp.id);
  }

  async join(userId: string, competitionId: string) {
    const comp = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { _count: { select: { participations: true } } },
    });
    if (!comp) throw new NotFoundException('Competition not found');
    if (comp.status === 'FINISHED') throw new BadRequestException('Competition has ended');

    const existing = await this.prisma.participation.findUnique({
      where: { competitionId_userId: { competitionId, userId } },
    });
    if (!existing) {
      if (comp.maxParticipants && comp._count.participations >= comp.maxParticipants) {
        throw new BadRequestException('Competition is full');
      }
      await this.prisma.participation.create({
        data: { competitionId, userId, cashBalance: comp.startingBalance },
      });
    }
    return this.detail(userId, competitionId);
  }

  async leaderboardRows(competitionId: string) {
    const comp = await this.prisma.competition.findUnique({ where: { id: competitionId } });
    if (!comp) throw new NotFoundException('Competition not found');
    const parts = await this.prisma.participation.findMany({
      where: { competitionId },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
        positions: { where: { status: 'OPEN' } },
      },
    });
    const rows = parts.map((p) => {
      const equity = this.equityOf(p.cashBalance, p.positions);
      return {
        userId: p.user.id,
        username: p.user.username,
        avatarUrl: p.user.avatarUrl,
        equity,
        returnPct: ((equity - comp.startingBalance) / comp.startingBalance) * 100,
      };
    });
    rows.sort((a, b) => b.equity - a.equity);
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }

  async detail(userId: string, competitionId: string) {
    const comp = await this.prisma.competition.findUnique({
      where: { id: competitionId },
      include: { _count: { select: { participations: true } } },
    });
    if (!comp) throw new NotFoundException('Competition not found');
    const rows = await this.leaderboardRows(competitionId);
    const me = rows.find((r) => r.userId === userId);
    return {
      id: comp.id,
      name: comp.name,
      type: comp.type,
      instruments: comp.instruments,
      startingBalance: comp.startingBalance,
      maxLeverage: comp.maxLeverage,
      status: comp.status,
      startAt: comp.startAt,
      endAt: comp.endAt,
      joinCode: comp.joinCode,
      participantCount: comp._count.participations,
      myRank: me?.rank,
      myEquity: me?.equity,
      myReturnPct: me?.returnPct,
    };
  }

  async listMine(userId: string) {
    const parts = await this.prisma.participation.findMany({
      where: { userId },
      select: { competitionId: true },
    });
    const competitions = await Promise.all(
      parts.map((p) => this.detail(userId, p.competitionId)),
    );
    return { competitions };
  }

  async listPublic() {
    const comps = await this.prisma.competition.findMany({
      where: { type: 'PUBLIC_DIVISION', status: { in: ['SCHEDULED', 'LIVE'] } },
      include: { _count: { select: { participations: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return {
      competitions: comps.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        instruments: c.instruments,
        startingBalance: c.startingBalance,
        maxLeverage: c.maxLeverage,
        status: c.status,
        startAt: c.startAt,
        endAt: c.endAt,
        joinCode: null,
        participantCount: c._count.participations,
      })),
    };
  }

  async leaderboard(userId: string, competitionId: string) {
    const rows = await this.leaderboardRows(competitionId);
    return { leaderboard: rows.map((r) => ({ ...r, isMe: r.userId === userId })) };
  }
}
