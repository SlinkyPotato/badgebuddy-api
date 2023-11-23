import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';
import CommonRequestDto from './common-request.dto';

export default class PutEventRequestDto extends CommonRequestDto {
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
