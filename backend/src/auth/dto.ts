import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @Matches(/^[A-Za-z0-9_.]{3,24}$/, {
    message: 'username must be 3–24 chars: letters, numbers, _ or .',
  })
  username!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}

export class SocialDto {
  @IsString()
  @MinLength(1)
  idToken!: string;
}

export class XpDto {
  @IsInt()
  @Min(1)
  @Max(10000)
  amount!: number;
}
