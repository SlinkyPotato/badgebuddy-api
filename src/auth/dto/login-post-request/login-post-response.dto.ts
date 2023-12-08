import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../user.dto';
import { TokenDto } from '../token.dto';

export class LoginPostResponseDto {
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
