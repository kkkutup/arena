import {
  IsString,
  IsInt,
  IsNumber,
  IsPositive,
  IsArray,
  ArrayMinSize,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsIn,
} from 'class-validator';

const COMPETITION_TYPES = [
  'PRIVATE_LEAGUE',
  'DUEL',
  'PUBLIC_DIVISION',
] as const;

export class CreateCompetitionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  name!: string;

  @IsIn(COMPETITION_TYPES)
  type!: (typeof COMPETITION_TYPES)[number];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instruments!: string[];

  @IsNumber()
  @Min(1000)
  @Max(10_000_000)
  startingBalance!: number;

  @IsInt()
  @Min(1)
  @Max(125)
  maxLeverage!: number;

  @IsInt()
  @Min(1)
  @Max(720)
  durationHours!: number;
}

export class JoinCodeDto {
  @IsString()
  @MinLength(4)
  @MaxLength(12)
  code!: string;
}

export class OpenPositionDto {
  @IsString()
  symbol!: string;

  @IsIn(['LONG', 'SHORT'])
  side!: 'LONG' | 'SHORT';

  @IsNumber()
  @IsPositive()
  qty!: number;

  @IsInt()
  @Min(1)
  @Max(125)
  leverage!: number;
}
