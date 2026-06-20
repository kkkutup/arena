import { IsString, MinLength, MaxLength } from 'class-validator';

export class FriendRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  userId!: string;
}
