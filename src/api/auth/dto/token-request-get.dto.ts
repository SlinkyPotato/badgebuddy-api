import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TokenRequestGetDto {
  @IsString()
  @ApiProperty({
    description: 'Authorization code',
    type: String,
  })
  code: string;

  @IsString()
  @ApiProperty({
    description: 'Grant type',
    type: String,
    enum: ['authorization_code', 'refresh_token'],
  })
  grantType: string;

  @IsString()
  @ApiProperty({
    description: 'The client ID',
    type: String,
  })
  clientId: string;

  @IsString()
  @ApiProperty({
    description: 'The generated code verifier',
    type: String,
  })
  codeVerifier: string;
}
