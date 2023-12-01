import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenDto {
  @IsString()
  @ApiProperty({
    description: 'The refresh token.',
    type: String,
  })
  token: string;

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
