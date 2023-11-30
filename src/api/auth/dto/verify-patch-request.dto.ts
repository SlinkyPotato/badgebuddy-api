import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPatchRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Encoded verification code',
    type: String,
  })
  code: string;
}
