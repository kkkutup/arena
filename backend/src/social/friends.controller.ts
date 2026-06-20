import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { FriendRequestDto } from './dto';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    return this.friends.list(u.userId);
  }

  @Get('search')
  search(@CurrentUser() u: AuthUser, @Query('q') q = '') {
    return this.friends.search(u.userId, q);
  }

  @Get('suggested')
  suggested(@CurrentUser() u: AuthUser) {
    return this.friends.suggested(u.userId);
  }

  @Post('request')
  request(@CurrentUser() u: AuthUser, @Body() dto: FriendRequestDto) {
    return this.friends.request(u.userId, dto.userId);
  }

  @Post(':userId/accept')
  accept(@CurrentUser() u: AuthUser, @Param('userId') userId: string) {
    return this.friends.accept(u.userId, userId);
  }

  @Delete(':userId')
  remove(@CurrentUser() u: AuthUser, @Param('userId') userId: string) {
    return this.friends.remove(u.userId, userId);
  }
}
