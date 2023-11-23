import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthorizeRequestGetDto {
  @IsString()
  @ApiProperty({
    description: 'The client ID',
  })
  clientId: string;

  @IsString()
  @ApiProperty({
    description: 'The code challenge method',
  })
  codeChallenge: string;

  @IsString()
  @ApiProperty({
    description: 'The code challenge',
  })
  codeChallengeMethod: string;

  @IsString()
  @ApiProperty({
    description: 'The scope of the request',
  })
  scope: string;

  @IsString()
  @ApiProperty({
    description: 'The state of the request',
  })
  state: string;
}
