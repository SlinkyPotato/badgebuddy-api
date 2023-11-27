import {
  Body,
  Controller,
  Get, Patch,
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
import { VerifyPatchRequestDto } from './dto/verify-patch-request.dto';

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
    description: 'Registered',
  })
  register(@Body() request: RegisterPostRequestDto): Promise<RegisterPostResponseDto> {
    return this.authService.register(request);
  }

  @UseGuards(ClientTokenGuard)
  @Patch('/verify/email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiHeaders([{
    name: 'Authorization',
    description: 'The authorization token',
    required: true,
  }])
  @ApiResponse({
    status: 200,
    description: 'Email verified',
  })
  verify(@Body() request: VerifyPatchRequestDto): Promise<void> {
    return this.authService.verify(request);
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
    @Body() request: LoginPostRequestDto
  ): Promise<LoginPostResponseDto> {
    return this.authService.login(request);
  }

  @Post('/test')
  test(): Promise<void> {
    return this.authService.test();
  }
}
