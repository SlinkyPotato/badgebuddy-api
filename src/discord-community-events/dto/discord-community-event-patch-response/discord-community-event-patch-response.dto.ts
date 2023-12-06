import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, IsUUID } from 'class-validator';

export class DiscordCommunityEventPatchResponseDto {
  @ApiProperty({
    required: true,
    description: 'The uuid of the event (generated by the server)',
  })
  @IsUUID()
  @IsString()
  id: string;

  @ApiProperty({
    required: true,
    description: 'The endDate of the event',
  })
  @IsString()
  @IsISO8601()
  endDate: Date;
}
