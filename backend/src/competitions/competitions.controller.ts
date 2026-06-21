import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { GlobalCompetitionService } from './global.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { CreateCompetitionDto, JoinCodeDto } from './dto';

@Controller('competitions')
@UseGuards(JwtAuthGuard)
export class CompetitionsController {
  constructor(
    private readonly comps: CompetitionsService,
    private readonly global: GlobalCompetitionService,
  ) {}

  @Get('global')
  globalRound(@CurrentUser() u: AuthUser) {
    return this.global.current(u.userId);
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: CreateCompetitionDto) {
    return this.comps.create(u.userId, dto);
  }

  @Get()
  mine(@CurrentUser() u: AuthUser) {
    return this.comps.listMine(u.userId);
  }

  @Get('public')
  publicList() {
    return this.comps.listPublic();
  }

  @Post('join')
  joinByCode(@CurrentUser() u: AuthUser, @Body() dto: JoinCodeDto) {
    return this.comps.joinByCode(u.userId, dto.code);
  }

  @Post(':id/join')
  join(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.comps.join(u.userId, id);
  }

  @Get(':id')
  detail(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.comps.detail(u.userId, id);
  }

  @Get(':id/leaderboard')
  leaderboard(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.comps.leaderboard(u.userId, id);
  }
}
