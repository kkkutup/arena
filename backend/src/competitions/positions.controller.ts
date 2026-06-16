import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { OpenPositionDto } from './dto';

@Controller('competitions/:id/positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positions: PositionsService) {}

  @Get()
  state(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.positions.accountState(u.userId, id);
  }

  @Post()
  open(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: OpenPositionDto) {
    return this.positions.open(u.userId, id, dto);
  }

  @Post(':posId/close')
  close(
    @CurrentUser() u: AuthUser,
    @Param('id') id: string,
    @Param('posId') posId: string,
  ) {
    return this.positions.close(u.userId, id, posId);
  }
}
