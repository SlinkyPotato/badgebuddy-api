import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsString, IsUUID } from 'class-validator';

export class DiscordCommunityEventPostResponseDto {
  @ApiProperty({
    required: true,
    description: 'The uuid of the community event',
  })
  @IsUUID()
  @IsString()
  communityEventId: string;

  @ApiProperty({
    required: true,
    description: 'The start date of the event',
  })
  @IsISO8601()
  startDate: string;

  @ApiProperty({
    required: true,
    description: 'The end date of the event',
  })
  @IsISO8601()
  endDate: string;
}
