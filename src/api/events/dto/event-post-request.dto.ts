import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNumberString, IsString } from 'class-validator';
import CommonRequestDto from './common-request.dto';

export default class PostEventRequestDto extends CommonRequestDto {
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
