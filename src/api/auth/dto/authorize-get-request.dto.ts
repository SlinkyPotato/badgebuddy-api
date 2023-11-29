import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsAlphanumeric, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthorizeGetRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The client ID',
    type: String,
  })
  clientId: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    description: 'The code challenge method',
    type: String,
  })
  codeChallenge: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    description: 'The code challenge',
    type: String,
  })
  codeChallengeMethod: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The scope of the request',
    type: String,
    required: false,
  })
  scope?: string;

  @IsString()
  @IsAlpha()
  @IsOptional()
  @ApiProperty({
    description: 'The state of the request',
    type: String,
    required: false,
  })
  state?: string;
}
