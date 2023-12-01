import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException, UnprocessableEntityException
} from '@nestjs/common';
import { AuthorizeGetRequestDto } from './dto/authorize-get-request.dto';
import { AuthorizeGetResponseDto } from './dto/authorize-get-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import crypto from 'crypto';
import { redisAuthKeys } from '../redis-keys.constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenGetRequestDto } from './dto/token-get-request.dto';
import { TokenPostResponseDto } from './dto/token-response-get.dto';
import { RegisterPostRequestDto } from './dto/register-post-request.dto';
import { LoginPostRequestDto } from './dto/login-post-request.dto';
import { LoginPostResponseDto } from './dto/login-post-response.dto';
import {
  DataSource,
} from 'typeorm';
import {
  UserEntity,
} from '@badgebuddy/common';
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import { RegisterPostResponseDto } from './dto/register-post-response.dto';
import base64url from 'base64url';
import { RefreshTokenPostRequestDto } from './dto/refresh-token-post-request.dto';
import { RefreshTokenPostResponseDto } from './dto/refresh-token-post-response.dto';
import { EmailCode } from './pipes/email-code.pipe';
import { LoginEmailPostResponseDto } from './dto/login-email-post-response-dto';
import { OAuth2Client } from 'google-auth-library';


type RedisAuthCode = {
  codeChannelMethod: string;
  codeChallenge: string;
};

type AccessToken ={
  iat: number,
  exp: number,
  iss: string,
  sub: string,
};

export type UserToken = {
  userId: string,
} & AccessToken;

@Injectable()
export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = 86400;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = 604800;
  private googleOAuthClient: OAuth2Client;

  private transporter: nodemailer.Transporter;

  constructor(
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      }
    });
    this.googleOAuthClient = new OAuth2Client(
      process.env.AUTH_GOOGLE_CLIENT_ID,
      process.env.AUTH_GOOGLE_CLIENT_SECRET,
      process.env.AUTH_GOOGLE_REDIRECT_URI,
    );
  }

  /**
   * Generate an auth code.
   * @param request AuthorizeRequestGetDto
   * @returns Promise<AuthorizeGetResponseDto>
   *
   * @see https://tools.ietf.org/html/rfc7636
   */
  async generateAuthCode(request: AuthorizeGetRequestDto): Promise<AuthorizeGetResponseDto> {
    this.logger.debug(`Attempting to generate auth token for client: ${request.clientId}`);
    const code = crypto.randomBytes(16).toString('hex');
    await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, code));

    const stored: RedisAuthCode = {
      codeChannelMethod: request.codeChallengeMethod,
      codeChallenge: request.codeChallenge,
    };

    const signed = this.jwtService.sign(stored, {
      expiresIn: '10m',
      subject: request.clientId,
    })

    await this.cacheManager.set(redisAuthKeys.AUTH_REQUEST(request.clientId, code), signed);
    this.logger.debug(`Generated auth code ${code} for client ${request.clientId}`);
    return {
      code,
    }
  }

  authorizeGoogle(): string {
    const authorizeUrl = this.googleOAuthClient.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.profile',
    });
    console.log(authorizeUrl);
    return authorizeUrl;
  }

  /**
   * Generate an access token.
   * @param request TokenRequestGetDto
   * @returns Promise<string>
   *
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
   */
  async generateAccessToken(request: TokenGetRequestDto): Promise<TokenPostResponseDto> {
    this.logger.debug(`Attempting to generate access token for client ${request.clientId} with auth code ${request.code}`);
    const cacheAuthCode = await this.cacheManager.get<string>(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));
    if (!cacheAuthCode) {
      throw new NotFoundException('Auth code not found');
    }
    let verifiedStored: RedisAuthCode;
    try {
      verifiedStored = this.jwtService.verify<RedisAuthCode>(cacheAuthCode);
    } catch (error) {
      await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));
      throw new UnprocessableEntityException('Auth code invalid');
    }

    await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));

    switch (verifiedStored.codeChannelMethod) {
      case 's256':
        const codeChallenge = crypto.createHash('sha256').update(request.codeVerifier).digest('hex').toString();
        this.logger.debug(codeChallenge);
        this.logger.debug(verifiedStored.codeChallenge);
        if (codeChallenge !== verifiedStored.codeChallenge) {
          throw new UnprocessableEntityException('Code challenge invalid');
        }
        break;
      default:
        throw new BadRequestException('Code challenge method invalid');
    }

    const accessToken = this.jwtService.sign({}, {
      expiresIn: '1h',
      subject: request.clientId,
    });

    this.logger.debug(`Generated access token for client ${request.clientId} with auth code ${request.code}`);
    return {
      tokenType: 'Bearer',
      expiresIn: 3600,
      accessToken,
    };
  }

  /**
   * Refresh an access token.
   * @param request RefreshTokenPostRequestDto
   * @returns Promise<RefreshTokenPostResponseDto>
   *
   * @see https://tools.ietf.org/html/rfc6749#section-6
   */
  async refreshAccessToken(request: RefreshTokenPostRequestDto, requestAccessToken: string): Promise<RefreshTokenPostResponseDto> {    
    this.logger.debug(`Attempting to refresh access token for client`);
    const decodedAccessToken = this.jwtService.decode<UserToken>(requestAccessToken);
    let decodedRefresh: UserToken;
    try {
      decodedRefresh = this.jwtService.verify<UserToken>(request.refreshToken);
      if (!decodedRefresh.userId || decodedRefresh.sub !== decodedAccessToken.sub || decodedRefresh.iss !== decodedAccessToken.iss || decodedRefresh.userId !== decodedAccessToken.userId) {
        throw new UnprocessableEntityException('Invalid refresh token');
      }
    } catch (error) {
      throw new UnprocessableEntityException('Invalid token invalid');
    }
    const cacheRefreshToken = await this.cacheManager.get<string>(redisAuthKeys.AUTH_REFRESH_TOKEN(decodedRefresh.userId));
    if (!cacheRefreshToken || cacheRefreshToken !== request.refreshToken) {
      throw new NotFoundException('Invalid refresh token');
    }
    
    const { accessToken , refreshToken } = this.generateTokens(decodedAccessToken.sub, decodedAccessToken.userId);

    return {
      tokenType: 'Bearer',
      expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * Register a user.
   * @param request RegisterRequestPostDto
   * @returns Promise<RegisterPostResponseDto>
   */
  async register(request: RegisterPostRequestDto): Promise<RegisterPostResponseDto> {
    this.logger.debug(`Attempting to register user ${request.email}`);
    let userId: string;
    const foundUser = await this.dataSource.createQueryBuilder()
        .select('user')
        .from(UserEntity, 'user')
        .where('user.email = :email', { email: request.email })
        .getOne();
    if (foundUser) {
      this.logger.warn(`User ${request.email} already exists`);
      throw new ConflictException('User already exists');
    }
    try {
      const result = await this.dataSource.manager.insert(UserEntity, {
        email: request.email,
        passwordHash: request.passwordHash,
      });
      userId = result.identifiers[0].id;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to register user');
    }

    const randomHash = crypto.randomBytes(16).toString('base64url');
    const encoding = base64url(`${request.email}:${randomHash}`);
    
    this.cacheManager.set(redisAuthKeys.AUTH_EMAIL_VERIFY(request.email), encoding, (1000 * 60 * 60 * 24)).then(() =>  {
      this.logger.debug(`Set email verification for ${request.email} in cache`);
    }).catch((error) => {
      this.logger.error(`Failed to set email verification for ${request.email} in cache`, error);
    });
    
    const mjmlParse = this.generateConfirmationEmailHtml(encoding);
    
    this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: 'patinobrian@gmail.com',
      subject: 'Welcome to BadgeBuddy',
      text: 'Please confirm your email.',
      html: mjmlParse.html,
    }).then((info) => {
      this.logger.debug(`Sent confirmation email to ${request.email}`, info);
    }).catch((error) => {
      this.logger.error(`Failed to send confirmation email to ${request.email}`, error);
    });
    
    this.logger.debug(`Registered user ${request.email}`);
    
    return {
      user: userId,
    }
  }

  /**
   * Login a user.
   * @param request LoginRequestPostDto
   * @returns Promise<LoginPostResponseDto>
   */
  async login(request: LoginPostRequestDto): Promise<LoginPostResponseDto> {
    this.logger.debug(`Attempting to login user ${request.email}`);

    const user = await this.dataSource.createQueryBuilder()
      .select('user')
      .from(UserEntity, 'user')
      .where('user.email = :email', { email: request.email })
      .andWhere('user.password_hash = :hash', { hash: request.passwordHash })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { accessToken, refreshToken } = this.generateTokens(request.clientId, user.id);

    this.logger.debug(`Logged in user ${request.email}`);
    return {
      user: {
        id: user.id,
        email: user.email!,
        emailVerifiedOn: user.emailVerifiedOn!.toISOString(),
        name: user.name ?? undefined,
      },
      tokenType: 'Bearer',
      expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN,
      accessToken,
      refreshToken
    };
  }

  async loginGoogle(code: string, state: string): Promise<any> {
    this.logger.debug(`Attempting to login user with google`);
    console.log(code);
    const result = await this.googleOAuthClient.getToken(code);
    console.log(result);
    this.googleOAuthClient.setCredentials(result.tokens);
    return {
      accessToken: result.tokens.access_token,
      refreshToken: result.tokens.refresh_token,
    };
  }

  private generateTokens(clientId: string, userId: string): { accessToken: string, refreshToken: string } {
    const accessToken = this.jwtService.sign({
      userId: userId,
    }, {
      expiresIn: '24h',
      subject: clientId,
    });

    const refreshToken = this.jwtService.sign({
      userId: userId,
    }, {
      expiresIn: '7d',
      subject: clientId,
    });

    this.cacheManager.set(redisAuthKeys.AUTH_REFRESH_TOKEN(userId), refreshToken, (AuthService.REFRESH_TOKEN_EXPIRES_IN * 1000)).then(() =>  {
      this.logger.debug(`Set refresh token for ${userId} in cache`);
    }).catch((error) => {
      this.logger.error(`Failed to store refresh token for ${userId}`, error);
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate an access token for the registered email.
   * @param request emailCode
   * @param clientId the approved client id
   * @returns LoginEmailPostResponseDtos
   */
  async loginEmail(request: EmailCode, clientId: string): Promise<LoginEmailPostResponseDto> {
    this.logger.debug(`Attempting to verify email code`);
    
    const encoding = await this.cacheManager.get<string>(redisAuthKeys.AUTH_EMAIL_VERIFY(request.email));
    if (!encoding) {
      throw new NotFoundException('Email verification not found');
    }
    const [email, randomHash] = base64url.decode(encoding).split(':');
    if (email !== request.email || randomHash !== request.code) {
      throw new UnprocessableEntityException('Email verification invalid');
    }

    let user: UserEntity | null;
    try {
      user = await this.dataSource.createQueryBuilder()
        .select('user')
        .from(UserEntity, 'user')
        .where('user.email = :email', { email: request.email })
        .getOne();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const result = await this.dataSource.createQueryBuilder()
        .update(UserEntity)
        .set({ emailVerifiedOn: new Date() })
        .where('email = :email', { email: request.email })
        .andWhere('email_verified_on IS NULL')
        .execute();
      if (result.affected === 1) {
        this.logger.debug(`Updated user ${request.email} with email verification`);
      }
    } catch(error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed update db');
    }

    await this.cacheManager.del(redisAuthKeys.AUTH_EMAIL_VERIFY(request.email));

    const { accessToken, refreshToken } = this.generateTokens(clientId, user.id);

    return {
      user: {
        id: user.id,
        email: request.email,
        emailVerifiedOn: user.emailVerifiedOn!.toISOString(),
      },
      tokenType: 'Bearer',
      expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN,
      accessToken,
      refreshToken,
    };
  }

  private generateConfirmationEmailHtml(encoding: string) {
    return mjml2html(`
      <mjml>
        <mj-body>
          <mj-section background-color="#222b45">
            <mj-column>
              <mj-text  
                    align="center"
                    font-style="italic"
                    font-size="20px"
                    color="#fff">
                BadgeBuddy
              </mj-text>
            </mj-column>
          </mj-section>
          <mj-section>
            <mj-column>
              <mj-spacer height="20px" />
              <mj-divider border-color="#222b45"></mj-divider>
              
              <mj-spacer height="100px" />
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
                gm 👋,
              </mj-text>
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
                Thank you for creating an account on BadgeBuddy!
              </mj-text>
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
              I hope you enjoy the services provided. Hit the button to confirm your email. If this wasn't you, please ignore 🤖
              </mj-text>
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
              wgmi
              </mj-text>
              <mj-spacer height="75px" />
              <mj-button background-color="#222b45"
                           href="http://localhost:4200/verify?type=email&code=${encoding}">Confirm Email</mj-button>
              <mj-spacer height="75px" />
              
              <mj-divider border-color="#222b45"></mj-divider>
            </mj-column>
          </mj-section>
          <mj-section>
            <mj-column>
              <mj-text color="#222b45"><a href="#">Homepage</a> | <a href="#">Discord</a> | <a href="#">Terms &amp; Service</a></mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `);
  }
}
