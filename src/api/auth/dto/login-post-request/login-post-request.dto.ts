import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPostRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user email',
    type: String,
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The hash of the password',
    type: String,
  })
  passwordHash: string;

}
