import { ApiProperty } from '@nestjs/swagger';

export default class PostGuildResponseDto {
  @ApiProperty({
    description: 'The ID of the document created in the database',
  })
  _id: string;
}
