import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';

@Controller('ranking')
@UseGuards(JwtAuthGuard)
export class RankingController {
  constructor(private readonly ranking: RankingService) {}

  @Get()
  board(@CurrentUser() u: AuthUser, @Query('metric') metric?: string) {
    return this.ranking.board(u.userId, metric);
  }
}
