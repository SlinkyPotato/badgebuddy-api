import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPostRequestDto {
  @IsString()
  @ApiProperty({
    description: 'Email address',
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
