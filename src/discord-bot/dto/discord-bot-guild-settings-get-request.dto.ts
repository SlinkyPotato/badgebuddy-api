import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DiscordBotGuildSettingsGetRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    name: 'guildId',
    required: true,
    description: 'The ID of the guild',    
  })
  guildId: string;
}
