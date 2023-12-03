import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDiscordPostRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The auth code',
    type: String,
  })
  authCode: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The state',
    type: String,
  })
  state: string;
}
