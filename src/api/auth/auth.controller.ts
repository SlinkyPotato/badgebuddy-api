import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizeRequestGetDto } from './dto/authorize-request-get.dto';
import { AuthorizeResponseGetDto } from './dto/authorize-response-get.dto';
import { TokenRequestGetDto } from './dto/token-request-get.dto';
import { TokenResponsePostDto } from './dto/token-response-get.dto';
import { ClientGuard } from './guards/client.guard';
import { AuthService } from './auth.service';
import { UserGuard } from './guards/user.guard';

@Controller('auth')
@ApiTags('auth')
@UseGuards(ClientGuard)
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @UseGuards(UserGuard)
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
  token(@Body() request: TokenRequestGetDto): Promise<TokenResponsePostDto> {
    return this.authService.generateAccessToken(request);
  }
}
