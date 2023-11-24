import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthorizeResponseGetDto {
  @IsString()
  @ApiProperty({
    description: 'Authorization code',
    type: String,
  })
  code: string;

  @IsString()
  @ApiProperty({
    description: 'State',
    type: String,
  })
  state: string;
}
