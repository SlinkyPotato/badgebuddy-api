import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';

export class UserDto {
  @IsString()
  @IsUUID()
  @ApiProperty({
    description: 'The user id.',
    type: String,
    required: true,
  })
  id: string;

  @IsString()
  @IsEmail()
  @ApiProperty({
    description: 'The user email.',
    type: String,
    required: true,
  })
  email: string;

  @IsString()
  @IsISO8601()
  @ApiProperty({
    description: 'Email verification date.',
    type: String,
  })
  emailVerifiedOn: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The name of the user.',
    type: String,
    required: false,
  })
  name?: string;
}
