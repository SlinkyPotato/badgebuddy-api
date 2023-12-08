import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DiscordBotPermissionsPatchRequestDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Discord snowflake guild ID',
  })
  guildSId: string;

}
