import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizeRequestGetDto } from './dto/authorize-request-get.dto';
import { AuthorizeResponseGetDto } from './dto/authorize-response-get.dto';
import { TokenRequestGetDto } from './dto/token-request-get.dto';
import { TokenResponsePostDto } from './dto/token-response-get.dto';
import { ClientGuard } from './guards/client.guard';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
@UseGuards(ClientGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('/authorize')
  @ApiOperation({ summary: 'Get auth token' })
  @ApiResponse({
    status: 200,
    description: 'Authorized',
    type: AuthorizeResponseGetDto,
  })
  authorize(@Query() request: AuthorizeRequestGetDto): Promise<AuthorizeResponseGetDto> {
    return this.authService.generateAuthCode(request);
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
