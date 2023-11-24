import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AuthorizeRequestGetDto {
  @IsString()
  @ApiProperty({
    description: 'The client ID',
    type: String,
  })
  clientId: string;

  @IsString()
  @ApiProperty({
    description: 'The code challenge method',
    type: String,
  })
  codeChallenge: string;

  @IsString()
  @ApiProperty({
    description: 'The code challenge',
    type: String,
  })
  codeChallengeMethod: string;

  @IsString()
  @ApiProperty({
    description: 'The user ID',
    type: String,
  })
  userId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The scope of the request',
    type: String,
    required: false,
  })
  scope?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The state of the request',
    type: String,
    required: false,
  })
  state?: string;
}
