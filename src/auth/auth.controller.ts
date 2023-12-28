import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiHeaders,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { ClientIdGuard } from './guards/client-id/client-id.guard';
import { UserTokenNoVerifyGuard } from './guards/user-token-no-verify/user-token-guard-no-verify.guard';
import { EmailCode, EmailCodePipe } from './pipes/email-code/email-code.pipe';
import { AuthService } from './auth.service';
import {
  AuthorizeGetResponseDto,
  AuthorizeGetRequestDto,
  AuthorizeEmailPostRequestDto,
  AuthorizeGoogleGetResponseDto,
  AuthorizeDiscordGetResponseDto,
  TokenGetRequestDto,
  RefreshTokenPostResponseDto,
  RefreshTokenPostRequestDto,
  RegisterPostRequestDto,
  RegisterPostResponseDto,
  LoginPostRequestDto,
  LoginPostResponseDto,
  LoginEmailPostResponseDto,
  LoginGooglePostRequestDto,
  LoginGooglePostResponseDto,
  LoginDiscordPostResponseDto,
  LoginDiscordPostRequestDto,
  TokenGetResponseDto,
  AuthorizeEmailPostResponseDto,
} from '@badgebuddy/common';
import { AuthTypePipe } from './pipes/auth-type/auth-type.pipe';

@Controller('auth')
@ApiTags('Authentication')
@UsePipes(ValidationPipe)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ClientIdGuard)
  @Get('/authorize')
  @ApiOperation({ summary: 'Get auth token' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthorizeGetResponseDto,
  })
  authorize(
    @Query() request: AuthorizeGetRequestDto,
  ): Promise<AuthorizeGetResponseDto> {
    return this.authService.authorize(request);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/authorize/email')
  @ApiOperation({ summary: 'Send magic email code' })
  @ApiResponse({
    status: 201,
    description: 'Created',
  })
  authorizeEmail(
    @Body() request: AuthorizeEmailPostRequestDto,
  ): AuthorizeEmailPostResponseDto {
    return this.authService.authorizeEmail(request);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/authorize/google')
  @ApiOperation({ summary: 'Authorize google' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthorizeGoogleGetResponseDto,
  })
  authorizeGoogle(
    @Headers('Authorization') clientToken: string,
    @Query('type', AuthTypePipe) type: string,
  ): Promise<AuthorizeGoogleGetResponseDto> {
    return this.authService.authorizeGoogle(clientToken, type);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/authorize/discord')
  @ApiOperation({ summary: 'Authorize discord' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AuthorizeDiscordGetResponseDto,
  })
  @ApiQuery({
    name: 'type',
    description: 'Type of auth',
    required: true,
    enum: ['register', 'login'],
  })
  authorizeDiscord(
    @Headers('Authorization') clientToken: string,
    @Query('type', AuthTypePipe) type: string,
  ): Promise<AuthorizeDiscordGetResponseDto> {
    return this.authService.authorizeDiscord(clientToken, type);
  }

  @UseGuards(ClientIdGuard)
  @Post('/token')
  @ApiOperation({ summary: 'Get client token' })
  @ApiResponse({
    status: 201,
    description: 'Created',
    type: TokenGetResponseDto,
  })
  token(@Body() request: TokenGetRequestDto): Promise<TokenGetResponseDto> {
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
  refresh(
    @Headers('Authorization') authorization: string,
    @Body() request: RefreshTokenPostRequestDto,
  ): Promise<RefreshTokenPostResponseDto> {
    return this.authService.refreshAccessToken(
      request,
      authorization.split(' ')[1],
    );
  }

  @UseGuards(AccessTokenGuard)
  @Post('/register')
  @ApiOperation({ summary: 'Register user' })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'The authorization token',
      required: true,
    },
  ])
  @ApiResponse({
    status: 201,
    description: 'Created',
  })
  register(
    @Body() request: RegisterPostRequestDto,
  ): Promise<RegisterPostResponseDto> {
    return this.authService.register(request);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 201,
    description: 'Created auth token',
  })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'The authorization token',
      required: true,
    },
  ])
  login(
    @Headers('Authorization') clientToken: string,
    @Body() request: LoginPostRequestDto,
  ): Promise<LoginPostResponseDto> {
    return this.authService.login(clientToken, request);
  }

  @UseGuards(AccessTokenGuard)
  @Post('/login/email')
  @ApiOperation({ summary: 'Login by email' })
  @ApiHeaders([
    {
      name: 'Authorization',
      description: 'The authorization token',
      required: true,
    },
  ])
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

  @UseGuards(AccessTokenGuard)
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

  @UseGuards(AccessTokenGuard)
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
