import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthorizeRequestGetDto {
  @IsString()
  @ApiProperty({
    description: 'The client ID',
    type: String,
  })
  clientId: string;

  @IsString()
  @ApiProperty({
    description: 'The code challenge method',
    type: String,
  })
  codeChallenge: string;

  @IsString()
  @ApiProperty({
    description: 'The code challenge',
    type: String,
  })
  codeChallengeMethod: string;

  @IsString()
  @ApiProperty({
    description: 'The scope of the request',
    type: String,
  })
  scope: string;

  @IsString()
  @ApiProperty({
    description: 'The state of the request',
    type: String,
  })
  state: string;
}
