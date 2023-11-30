import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginEmailPostRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The client ID',
    type: String,
  })
  clientId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Encoded verification code',
    type: String,
  })
  code: string;
}
