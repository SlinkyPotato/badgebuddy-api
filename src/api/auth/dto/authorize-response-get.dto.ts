import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AuthorizeResponseGetDto {
  @IsString()
  @ApiProperty({
    description: 'Authorization code',
    type: String,
  })
  code: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'State',
    type: String,
    required: false,
  })
  state?: string;
}
