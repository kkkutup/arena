import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MarketService } from '../market/market.service';
import { isLiquidated, unrealizedPnl, type Side } from '../trading/engine';

@Injectable()
export class LiquidationService {
  private readonly logger = new Logger(LiquidationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly market: MarketService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async sweep(): Promise<void> {
    const prices = this.market.getPrices();
    if (Object.keys(prices).length === 0) return;

    const open = await this.prisma.position.findMany({
      where: { status: 'OPEN' },
    });
    let liquidated = 0;
    for (const p of open) {
      const price = prices[p.symbol];
      if (price === undefined) continue;
      if (isLiquidated(p.side, p.liquidationPrice, price)) {
        const pnl = unrealizedPnl(
          p.side,
          p.qty,
          p.entryPrice,
          p.liquidationPrice,
        );
        await this.prisma.$transaction([
          this.prisma.position.update({
            where: { id: p.id },
            data: {
              status: 'LIQUIDATED',
              closePrice: p.liquidationPrice,
              realizedPnl: pnl,
              closedAt: new Date(),
            },
          }),
          this.prisma.participation.update({
            where: { id: p.participationId },
            data: { cashBalance: { increment: pnl } },
          }),
        ]);
        liquidated++;
      }
    }
    if (liquidated > 0) this.logger.log(`Liquidated ${liquidated} position(s)`);
  }
}
