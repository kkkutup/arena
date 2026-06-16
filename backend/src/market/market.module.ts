import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { MarketGateway } from './market.gateway';

@Module({
  controllers: [MarketController],
  providers: [MarketService, MarketGateway],
  exports: [MarketService],
})
export class MarketModule {}
