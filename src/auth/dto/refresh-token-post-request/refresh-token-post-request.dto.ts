import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenPostRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Refresh token',
    type: String,
  })
  refreshToken: string;
}
