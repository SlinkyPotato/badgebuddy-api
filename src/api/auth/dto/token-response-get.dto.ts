import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TokenResponsePostDto {
  @IsString()
  @ApiProperty({
    description: 'Access token',
    type: String,
  })
  accessToken: string;

  @IsString()
  @ApiProperty({
    description: 'Refresh token',
    type: String,
  })
  refreshToken: string;

  @IsString()
  @ApiProperty({
    description: 'Token type',
    type: String,
  })
  tokenType: string;

  @IsString()
  @ApiProperty({
    description: 'Expires in',
    type: Number,
  })
  expiresIn: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Scope',
    type: String,
    required: false,
  })
  scope?: string;

}
