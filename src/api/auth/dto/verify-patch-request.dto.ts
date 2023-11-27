import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPatchRequestDto {
  @IsString()
  @ApiProperty({
    description: 'Encoded verification code',
    type: String,
  })
  encoding: string;
}
