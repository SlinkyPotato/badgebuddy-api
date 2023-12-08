import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class AuthorizeDiscordGetResponseDto {
  @IsString()
  @IsUrl()
  @ApiProperty({
    description: 'URL to redirect to',
    example: 'https://discord.com/',
  })
  authorizeUrl: string;
}
