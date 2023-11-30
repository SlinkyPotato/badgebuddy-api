import {
  Body,
  Controller,
  Get, Headers, Patch,
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
import { AuthorizeGetRequestDto } from './dto/authorize-get-request.dto';
import { AuthorizeGetResponseDto } from './dto/authorize-get-response.dto';
import { TokenGetRequestDto } from './dto/token-get-request.dto';
import { TokenPostResponseDto } from './dto/token-response-get.dto';
import { AuthService } from './auth.service';
import { RegisterPostRequestDto } from './dto/register-post-request.dto';
import { LoginPostRequestDto } from './dto/login-post-request.dto';
import { LoginPostResponseDto } from './dto/login-post-response.dto';
import { ClientTokenGuard } from './guards/client-token.guard';
import { ClientIdGuard } from './guards/client-id.guard';
import { RegisterPostResponseDto } from './dto/register-post-response.dto';
import { LoginEmailPostRequestDto } from './dto/login-email-post-request.dto';
import { RefreshTokenPostResponseDto } from './dto/refresh-token-post-response.dto';
import { RefreshTokenPostRequestDto } from './dto/refresh-token-post-request.dto';
import { UserTokenNoVerifyGuard } from './guards/user-token-guard-no-verify.guard';
import { EmailCode, EmailCodePipe } from './pipes/email-code.pipe';
import { LoginEmailPostResponseDto } from './login-email-post-response-dto';

@Controller('auth')
@ApiTags('auth')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @UseGuards(ClientIdGuard)
  @Get('/authorize')
  @ApiOperation({ summary: 'Get auth token' })
  @ApiResponse({
    status: 200,
    description: 'Authorized',
    type: AuthorizeGetResponseDto,
  })
  authorize(@Query() request: AuthorizeGetRequestDto): Promise<AuthorizeGetResponseDto> {
    return this.authService.generateAuthCode(request);
  }

  @UseGuards(ClientIdGuard)
  @Post('/token')
  @ApiOperation({ summary: 'Get token' })
  @ApiResponse({
    status: 200,
    description: 'Token',
    type: TokenPostResponseDto,
  })
  token(@Body() request: TokenGetRequestDto): Promise<TokenPostResponseDto> {
    return this.authService.generateAccessToken(request);
  }

  @UseGuards(UserTokenNoVerifyGuard)
  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed',
    type: RefreshTokenPostResponseDto,
  })
  refresh(@Headers('Authorization') authorization: string, @Body() request: RefreshTokenPostRequestDto): Promise<RefreshTokenPostResponseDto> {
    return this.authService.refreshAccessToken(request, authorization.split(' ')[1]);
  }

  @UseGuards(ClientTokenGuard, ClientIdGuard)
  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  @ApiResponse({
    status: 201,
    description: 'Registered',
  })
  register(@Body() request: RegisterPostRequestDto): Promise<RegisterPostResponseDto> {
    return this.authService.register(request);
  }

  @UseGuards(ClientTokenGuard, ClientIdGuard)
  @Post('/login/email')
  @ApiOperation({ summary: 'Login by email' })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  @ApiResponse({
    status: 200,
    description: 'Logged in by email',
  })
  loginEmail(
    @Body(ValidationPipe) request: LoginEmailPostRequestDto,
    @Body('code', ValidationPipe, EmailCodePipe) emailCode: EmailCode,
  ): Promise<LoginEmailPostResponseDto> {
    return this.authService.loginEmail(emailCode, request.clientId);
  }

  @UseGuards(ClientTokenGuard, ClientIdGuard)
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
    @Body() request: LoginPostRequestDto
  ): Promise<LoginPostResponseDto> {
    return this.authService.login(request);
  }

}
