import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class RegisterPostResponseDto {
  @IsString()
  @ApiProperty({
    description: 'The access token.',
    type: String,
  })
  accessToken: string;

  @IsString()
  @ApiProperty({
    description: 'The refresh token.',
    type: String,
  })
  refreshToken: string;

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

  @ApiProperty({
    description: 'The user.',
    type: UserDto,
  })
  user: UserDto;
}
