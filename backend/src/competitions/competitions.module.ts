import { Module } from '@nestjs/common';
import { MarketModule } from '../market/market.module';
import { AuthModule } from '../auth/auth.module';
import { CompetitionsService } from './competitions.service';
import { PositionsService } from './positions.service';
import { LiquidationService } from './liquidation.service';
import { CompetitionsController } from './competitions.controller';
import { PositionsController } from './positions.controller';

@Module({
  imports: [MarketModule, AuthModule],
  controllers: [CompetitionsController, PositionsController],
  providers: [CompetitionsService, PositionsService, LiquidationService],
})
export class CompetitionsModule {}
