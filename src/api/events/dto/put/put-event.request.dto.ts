import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';
import CommonRequest from '../common-request.interface';

export default class PutEventRequestDto extends CommonRequest {
  @ApiProperty({
    required: false,
    description: 'The ID of the event',
  })
  @IsNumberString()
  @IsOptional()
  _id: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the tracking voice channel',
  })
  @IsNumberString()
  voiceChannelId: string;
}
