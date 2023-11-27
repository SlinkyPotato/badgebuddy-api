import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPostResponseDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'The user id of the newly registered user',
  })
  userId: string;
}
