import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiHeaders,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthorizeRequestGetDto } from './dto/authorize-request-get.dto';
import { AuthorizeResponseGetDto } from './dto/authorize-response-get.dto';
import { TokenRequestGetDto } from './dto/token-request-get.dto';
import { TokenResponsePostDto } from './dto/token-response-get.dto';
import { AuthService } from './auth.service';
import { RegisterRequestPostDto } from './dto/register-request-post.dto';
import { LoginRequestPostDto } from './dto/login-request-post.dto';
import { LoginResponsePostDto } from './dto/login-response-post.dto';
import { ClientTokenGuard } from './guards/client-token.guard';
import { ClientIdGuard } from './guards/client-id.guard';

@Controller('auth')
@ApiTags('auth')
@UseGuards(ClientIdGuard)
@UsePipes(ValidationPipe)
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
  token(@Body() request: TokenRequestGetDto): Promise<TokenResponsePostDto> {
    return this.authService.generateAccessToken(request);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  @ApiResponse({
    status: 200,
    description: 'Registered',
  })
  register(@Body() request: RegisterRequestPostDto): Promise<void> {
    return this.authService.register(request);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Logged in',
  })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  login(
    @Body() request: LoginRequestPostDto
  ): Promise<LoginResponsePostDto> {
    return this.authService.login(request);
  }
}
