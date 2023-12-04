import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TokenDto } from '../token.dto';
import { UserDto } from '../user.dto';

export class LoginDiscordPostResponseDto {
  @IsString()
  @ApiProperty({
    description: 'The access token.',
    type: TokenDto,
  })
  accessToken: TokenDto;

  @IsString()
  @ApiProperty({
    description: 'The refresh token.',
    type: TokenDto,
  })
  refreshToken: TokenDto;

  @ApiProperty({
    description: 'The user.',
    type: UserDto,
  })
  user: UserDto;
}
