import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPostRequestDto {
  @IsString()
  @ApiProperty({
    description: 'The user email',
    type: String,
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'The hash of the password',
    type: String,
  })
  passwordHash: string;
}
