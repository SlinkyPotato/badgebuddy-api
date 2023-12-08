import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DiscordBotPostRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: 'The ID of the guild given from discord.',
  })
  guildSId: string;
}
