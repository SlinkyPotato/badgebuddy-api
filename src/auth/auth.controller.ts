import {
  Body,
  Controller,
  Get, Headers, 
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiHeaders,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { ClientTokenGuard } from './guards/client-token/client-token.guard';
import { ClientIdGuard } from './guards/client-id/client-id.guard';
import { UserTokenNoVerifyGuard } from './guards/user-token-no-verify/user-token-guard-no-verify.guard';
import { EmailCode, EmailCodePipe } from './pipes/email-code.pipe';
import { AuthService } from './auth.service';
import { AuthorizeGetRequestDto } from './dto/authorize-get-request/authorize-get-request.dto';
import { AuthorizeGetResponseDto } from './dto/authorize-get-request/authorize-get-response.dto';
import { LoginEmailPostResponseDto } from './dto/login-email-post-request/login-email-post-response-dto';
import { LoginGooglePostRequestDto } from './dto/login-google-post-request/login-google-post-request-dto';
import { LoginPostRequestDto } from './dto/login-post-request/login-post-request.dto';
import { LoginPostResponseDto } from './dto/login-post-request/login-post-response.dto';
import { RefreshTokenPostRequestDto } from './dto/refresh-token-post-request/refresh-token-post-request.dto';
import { RefreshTokenPostResponseDto } from './dto/refresh-token-post-request/refresh-token-post-response.dto';
import { RegisterPostRequestDto } from './dto/register-post-request/register-post-request.dto';
import { RegisterPostResponseDto } from './dto/register-post-request/register-post-response.dto';
import { TokenGetRequestDto } from './dto/token-get-request/token-get-request.dto';
import { TokenPostResponseDto } from './dto/token-get-request/token-get-response.dto';
import { LoginGooglePostResponseDto } from './dto/login-google-post-request/login-google-post-response-dto';
import { AuthorizeGoogleGetResponseDto } from './dto/authorize-google-get-response/authorize-google-get-response.dto';
import { AuthorizeEmailPostRequestDto } from './dto/authorize-email-post-request/authorize-email-post-request.dto';
import { LoginDiscordPostRequestDto } from './dto/login-discord-post-request/login-discord-post-request.dto';
import { LoginDiscordPostResponseDto } from './dto/login-discord-post-response/login-discord-post-response.dto';
import { AuthorizeDiscordGetResponseDto } from './dto/authorize-discord-get-response/authorize-discord-get-response.dto';

@Controller('auth')
@ApiTags('Authentication')
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
    description: 'Success',
    type: AuthorizeGetResponseDto,
  })
  authorize(
    @Query() request: AuthorizeGetRequestDto
  ): Promise<AuthorizeGetResponseDto> {
    return this.authService.authorize(request);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/authorize/email')
  @ApiOperation({ summary: 'Send magic email code' })
  @ApiResponse({
    status: 201,
    description: 'Created',
  })
  authorizeEmail(
    @Body() request: AuthorizeEmailPostRequestDto,
  ): Promise<void> {
    return this.authService.authorizeEmail(request);
  }

  @UseGuards(ClientTokenGuard)
  @Get('/authorize/google')
  @ApiOperation({ summary: 'Authorize google' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthorizeGoogleGetResponseDto,
  })
  authorizeGoogle(
    @Headers('Authorization') clientToken: string,
  ): Promise<AuthorizeGoogleGetResponseDto> {
    return this.authService.authorizeGoogle(clientToken);
  }

  @UseGuards(ClientTokenGuard)
  @Get('/authorize/discord')
  @ApiOperation({ summary: 'Authorize discord' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthorizeDiscordGetResponseDto,
  })
  authorizeDiscord(
    @Headers('Authorization') clientToken: string,
  ): Promise<AuthorizeDiscordGetResponseDto> {
    return this.authService.authorizeDiscord(clientToken);
  }

  @UseGuards(ClientIdGuard)
  @Post('/token')
  @ApiOperation({ summary: 'Get client token' })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: TokenPostResponseDto,
  })
  token(@Body() request: TokenGetRequestDto): Promise<TokenPostResponseDto> {
    return this.authService.generateClientToken(request);
  }

  @UseGuards(UserTokenNoVerifyGuard)
  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: RefreshTokenPostResponseDto,
  })
  refresh(@Headers('Authorization') authorization: string, @Body() request: RefreshTokenPostRequestDto): Promise<RefreshTokenPostResponseDto> {
    return this.authService.refreshAccessToken(request, authorization.split(' ')[1]);
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
    status: 201,
    description: 'Created',
  })
  register(
    @Body() request: RegisterPostRequestDto
  ): Promise<RegisterPostResponseDto> {
    return this.authService.register(request);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 201,
    description: 'Created auth token',
  })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  login(
    @Headers('Authorization') clientToken: string,
    @Body() request: LoginPostRequestDto
  ): Promise<LoginPostResponseDto> {
    return this.authService.login(clientToken, request);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/login/email')
  @ApiOperation({ summary: 'Login by email' })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  @ApiResponse({
    status: 201,
    description: 'Created auth token',
  })
  loginEmail(
    @Headers('Authorization') clientToken: string,
    @Body('code', ValidationPipe, EmailCodePipe) emailCode: EmailCode,
  ): Promise<LoginEmailPostResponseDto> {
    return this.authService.loginEmail(clientToken, emailCode);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/login/google')
  @ApiOperation({ summary: 'Login user by google' })
  @ApiResponse({
    status: 201,
    description: 'Created auth token',
    type: LoginGooglePostRequestDto,
  })
  loginGoogle(
    @Headers('Authorization') clientToken: string,
    @Body() request: LoginGooglePostRequestDto,
  ): Promise<LoginGooglePostResponseDto> {
    return this.authService.loginGoogle(clientToken, request);
  }

  @UseGuards(ClientTokenGuard)
  @Post('/login/discord')
  @ApiOperation({ summary: 'Login user by discord' })
  @ApiResponse({
    status: 201,
    description: 'Created auth token',
    type: LoginDiscordPostResponseDto,
  })
  loginDiscord(
    @Headers('Authorization') clientToken: string,
    @Body() request: LoginDiscordPostRequestDto,
  ): Promise<LoginDiscordPostResponseDto> {
    return this.authService.loginDiscord(clientToken, request);
  }

}
