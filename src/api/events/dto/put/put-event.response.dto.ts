import { ApiProperty } from '@nestjs/swagger';

export default class PutEventResponseDto {
  @ApiProperty({
    required: true,
    description: 'The ID of the event (generated by the server)',
  })
  _id: string;

  @ApiProperty({
    required: true,
    description: 'The status of the event.',
    default: false,
  })
  isActive: boolean;
}
