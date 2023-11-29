import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenPostResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Refresh token',
    type: String,
  })
  refreshToken: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Access token',
    type: String,
  })
  accessToken: string;

  @IsString()
  @ApiProperty({
    description: 'The token type.',
    type: String,
  })
  tokenType: string;

  @IsString()
  @ApiProperty({
    description: 'The token expiration in seconds.',
    type: Number,
  })
  expiresIn: number;
}
