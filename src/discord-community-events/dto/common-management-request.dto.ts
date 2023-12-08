import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class CommonManagementRequestDto {
  @ApiProperty({
    required: true,
    description: 'The snowflake ID of the guild',
  })
  @IsNumberString()
  guildSId: string;

  @ApiProperty({
    required: true,
    description: 'The snowflake ID of the organizer',
  })
  @IsNumberString()
  organizerSId: string;
}