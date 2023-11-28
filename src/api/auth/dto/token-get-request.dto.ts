import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsIn, IsString } from 'class-validator';

export class TokenGetRequestDto {
  @IsString()
  @IsAlphanumeric()
  @ApiProperty({
    description: 'Authorization code',
    type: String,
  })
  code: string;

  @IsString()
  @IsIn(['authorization_code', 'refresh_token'])
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
