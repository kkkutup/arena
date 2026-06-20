import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { UpdateMeDto, XpDto } from './dto';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly auth: AuthService) {}

  @Get()
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId);
  }

  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto) {
    return this.auth.updateMe(user.userId, dto);
  }

  // Client games (lessons/backtests) award XP locally and mirror it here so the
  // global ranking is server-side. Client-reported (not anti-cheat hardened).
  @Post('xp')
  @HttpCode(200)
  addXp(@CurrentUser() user: AuthUser, @Body() dto: XpDto) {
    return this.auth.addXp(user.userId, dto.amount);
  }
}
