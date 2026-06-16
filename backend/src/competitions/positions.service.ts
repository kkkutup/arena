import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import {
  marginRequired,
  liquidationPrice,
  unrealizedPnl,
  roe,
  type Side,
} from '../trading/engine';
import type { OpenPositionDto } from './dto';

@Injectable()
export class PositionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly market: MarketService,
  ) {}

  async accountState(userId: string, competitionId: string) {
    const part = await this.prisma.participation.findUnique({
      where: { competitionId_userId: { competitionId, userId } },
      include: {
        competition: true,
        positions: { where: { status: 'OPEN' }, orderBy: { openedAt: 'desc' } },
      },
    });
    if (!part) throw new ForbiddenException('Join the competition first');

    const prices = this.market.getPrices();
    let unreal = 0;
    let used = 0;
    const positions = part.positions.map((p) => {
      const mark = prices[p.symbol] ?? p.entryPrice;
      const pnl = unrealizedPnl(p.side as Side, p.qty, p.entryPrice, mark);
      unreal += pnl;
      used += p.margin;
      return {
        id: p.id,
        symbol: p.symbol,
        side: p.side,
        qty: p.qty,
        leverage: p.leverage,
        entryPrice: p.entryPrice,
        markPrice: mark,
        margin: p.margin,
        liquidationPrice: p.liquidationPrice,
        pnl,
        roe: roe(pnl, p.margin),
        status: p.status,
      };
    });
    const equity = part.cashBalance + unreal;
    return {
      competitionId,
      cashBalance: part.cashBalance,
      equity,
      usedMargin: used,
      freeMargin: equity - used,
      startingBalance: part.competition.startingBalance,
      totalPnl: equity - part.competition.startingBalance,
      positions,
    };
  }

  async open(userId: string, competitionId: string, dto: OpenPositionDto) {
    const part = await this.prisma.participation.findUnique({
      where: { competitionId_userId: { competitionId, userId } },
      include: { competition: true, positions: { where: { status: 'OPEN' } } },
    });
    if (!part) throw new ForbiddenException('Join the competition first');

    const comp = part.competition;
    if (comp.status !== 'LIVE') throw new BadRequestException('Competition is not live');
    if (!comp.instruments.includes(dto.symbol))
      throw new BadRequestException('Instrument not in this competition');
    if (dto.leverage > comp.maxLeverage)
      throw new BadRequestException(`Max leverage is ${comp.maxLeverage}x`);

    const price = this.market.getPrice(dto.symbol);
    if (!price) throw new BadRequestException('Price unavailable — try again');

    const margin = marginRequired(dto.qty, price, dto.leverage);
    const prices = this.market.getPrices();
    let unreal = 0;
    let used = 0;
    for (const p of part.positions) {
      unreal += unrealizedPnl(p.side as Side, p.qty, p.entryPrice, prices[p.symbol] ?? p.entryPrice);
      used += p.margin;
    }
    const freeMargin = part.cashBalance + unreal - used;
    if (margin > freeMargin + 1e-6) throw new BadRequestException('Insufficient free margin');

    await this.prisma.position.create({
      data: {
        participationId: part.id,
        symbol: dto.symbol,
        side: dto.side,
        qty: dto.qty,
        leverage: dto.leverage,
        entryPrice: price,
        margin,
        liquidationPrice: liquidationPrice(dto.side, price, dto.leverage),
      },
    });
    return this.accountState(userId, competitionId);
  }

  async close(userId: string, competitionId: string, positionId: string) {
    const part = await this.prisma.participation.findUnique({
      where: { competitionId_userId: { competitionId, userId } },
    });
    if (!part) throw new ForbiddenException('Join the competition first');

    const pos = await this.prisma.position.findFirst({
      where: { id: positionId, participationId: part.id, status: 'OPEN' },
    });
    if (!pos) throw new NotFoundException('Open position not found');

    const price = this.market.getPrice(pos.symbol) ?? pos.entryPrice;
    const pnl = unrealizedPnl(pos.side as Side, pos.qty, pos.entryPrice, price);
    await this.prisma.$transaction([
      this.prisma.position.update({
        where: { id: pos.id },
        data: { status: 'CLOSED', closePrice: price, realizedPnl: pnl, closedAt: new Date() },
      }),
      this.prisma.participation.update({
        where: { id: part.id },
        data: { cashBalance: { increment: pnl } },
      }),
    ]);
    return this.accountState(userId, competitionId);
  }
}
