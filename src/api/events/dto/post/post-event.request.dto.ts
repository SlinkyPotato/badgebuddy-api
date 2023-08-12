import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsString } from 'class-validator';
import CommonRequest from '../common-request.interface';

export default class PostEventRequestDto extends CommonRequest {
  @ApiProperty({
    required: true,
    description: 'The name of the event',
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    required: true,
    description: 'The ID of the tracking voice channel',
  })
  @IsNumberString()
  voiceChannelId: string;

  @ApiProperty({
    required: true,
    description: 'The duration in minutes',
  })
  @IsNumber()
  duration: number;
}
