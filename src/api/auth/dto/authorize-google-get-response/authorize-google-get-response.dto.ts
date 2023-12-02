import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class AuthorizeGoogleGetResponseDto {
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: 'URL to redirect to',
    example: 'https://accounts.google.com',
  })
  redirectUrl: string;
}
