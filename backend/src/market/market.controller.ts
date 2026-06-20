import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { bySymbol } from './instruments';

@Controller('market')
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Get('instruments')
  instruments() {
    return { instruments: this.market.getInstruments() };
  }

  @Get('prices')
  prices() {
    return {
      prices: this.market.getPrices(),
      updatedAt: this.market.getUpdatedAt(),
    };
  }

  @Get('candles')
  async candles(
    @Query('symbol') symbol: string,
    @Query('interval') interval = '1m',
    @Query('limit') limit = '200',
  ) {
    if (!symbol || !bySymbol(symbol))
      throw new BadRequestException('Unknown symbol');
    const n = Math.min(Math.max(parseInt(limit, 10) || 200, 1), 1000);
    const candles = await this.market.getCandles(symbol, interval, n);
    return { candles };
  }
}
