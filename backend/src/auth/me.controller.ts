import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { UpdateMeDto } from './dto';

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
}
