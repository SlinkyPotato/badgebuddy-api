import { ApiProperty } from '@nestjs/swagger';

export class PostRegistrationResponseDto {
  @ApiProperty({
    description: 'The ID of the document created in the database',
  })
  _id: string;

  @ApiProperty({
    description: 'The ID of the guild',
  })
  guildId: string;
}
