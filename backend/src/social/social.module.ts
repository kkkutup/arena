import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';

@Module({
  imports: [AuthModule],
  controllers: [FriendsController, RankingController],
  providers: [FriendsService, RankingService],
})
export class SocialModule {}
