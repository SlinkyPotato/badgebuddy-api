import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterPostResponseDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The user ID',
    type: String,
  })
  user: string;
}
