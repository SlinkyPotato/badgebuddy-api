import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
  @ApiProperty({
    description: 'Scope',
    type: String,
  })
  scope: string;

}
