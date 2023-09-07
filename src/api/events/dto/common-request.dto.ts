import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export default class CommonRequestDto {
  @ApiProperty({
    required: true,
    description: 'The ID of the guild',
  })
  @IsNumberString()
  guildId: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the organizer',
  })
  @IsNumberString()
  organizerId: string;
}
