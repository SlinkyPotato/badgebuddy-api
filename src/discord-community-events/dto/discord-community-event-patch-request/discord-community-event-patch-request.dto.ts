import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';
import { CommonManagementRequestDto } from '../common-management-request.dto';

export class DiscordCommunityEventPatchRequestDto extends CommonManagementRequestDto {

  @ApiProperty({
    description: 'The snowflake ID of the tracking voice channel',
  })
  @IsNumberString()
  voiceChannelSId: string;
}
