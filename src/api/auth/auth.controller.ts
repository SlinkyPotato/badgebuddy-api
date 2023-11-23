import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizeRequestGetDto } from './dto/authorize-request-get.dto';
import { AuthorizeResponseGetDto } from './dto/authorize-response-get.dto';
import { TokenRequestGetDto } from './dto/token-request-get.dto';
import { TokenResponsePostDto } from './dto/token-response-get.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor() { }

  @Get('/authorize')
  @ApiOperation({ summary: 'Get auth token' })
  @ApiResponse({
    status: 200,
    description: 'Authorized',
    type: AuthorizeResponseGetDto,
  })
  authorize(@Query() request: AuthorizeRequestGetDto): string {
    return 'test';
  }

  @Post('/token')
  @ApiOperation({ summary: 'Get token' })
  @ApiResponse({
    status: 200,
    description: 'Token',
    type: TokenResponsePostDto,
  })
  token(@Query() request: TokenRequestGetDto): string {
    return 'test';
  }
}
