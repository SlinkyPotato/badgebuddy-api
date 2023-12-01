import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGooglePostRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The auth code',
    type: String,
  })
  authCode: string;
}
