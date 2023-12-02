import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException, NotImplementedException, UnprocessableEntityException
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import crypto from 'crypto';
import { redisAuthKeys } from '../redis-keys.constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  DataSource,
} from 'typeorm';
import {
  AccountEntity,
  TokenEntity,
  TokenType,
  UserEntity,
} from '@badgebuddy/common';
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import base64url from 'base64url';
import { EmailCode } from './pipes/email-code.pipe';
import { CodeChallengeMethod, CodeVerifierResults, OAuth2Client } from 'google-auth-library';
import { AuthorizeGetRequestDto } from './dto/authorize-get-request/authorize-get-request.dto';
import { AuthorizeGetResponseDto } from './dto/authorize-get-request/authorize-get-response.dto';
import { LoginEmailPostResponseDto } from './dto/login-email-post-request/login-email-post-response-dto';
import { LoginGooglePostRequestDto } from './dto/login-google-post-request/login-google-post-request-dto';
import { LoginGooglePostResponseDto } from './dto/login-google-post-request/login-google-post-response-dto';
import { LoginPostRequestDto } from './dto/login-post-request/login-post-request.dto';
import { LoginPostResponseDto } from './dto/login-post-request/login-post-response.dto';
import { RefreshTokenPostRequestDto } from './dto/refresh-token-post-request/refresh-token-post-request.dto';
import { RefreshTokenPostResponseDto } from './dto/refresh-token-post-request/refresh-token-post-response.dto';
import { RegisterPostRequestDto } from './dto/register-post-request/register-post-request.dto';
import { RegisterPostResponseDto } from './dto/register-post-request/register-post-response.dto';
import { TokenGetRequestDto } from './dto/token-get-request/token-get-request.dto';
import { TokenPostResponseDto } from './dto/token-get-request/token-get-response.dto';

type RedisAuthCode = {
  codeChannelMethod: string;
  codeChallenge: string;
};

type AccessToken ={
  iat: number,
  exp: number,
  iss: string,
  sub: string,
  sessionId: string,
};

export type UserToken = {
  userId: string,
} & AccessToken;

@Injectable()
export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRES_IN = 86400;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = 604800;

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
  }

  /**
   * Generate an auth code.
   * @param request AuthorizeRequestGetDto
   * @returns Promise<AuthorizeGetResponseDto>
   *
   * @see https://tools.ietf.org/html/rfc7636
   */
  async authorize(request: AuthorizeGetRequestDto): Promise<AuthorizeGetResponseDto> {
    this.logger.debug(`Attempting to generate auth token for client: ${request.clientId}`);
    const authCode = crypto.randomBytes(20).toString('hex');
    await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, authCode));

    const stored: RedisAuthCode = {
      codeChannelMethod: request.codeChallengeMethod,
      codeChallenge: request.codeChallenge,
    };

    const signed = this.jwtService.sign(stored, {
      expiresIn: '10m',
      subject: request.clientId,
    })

    await this.cacheManager.set(redisAuthKeys.AUTH_REQUEST(request.clientId, authCode), signed);
    this.logger.debug(`Generated auth code ${authCode} for client ${request.clientId}`);
    return {
      code: authCode,
    }
  }

  async authorizeGoogle(auth: string, reply: any): Promise<void> {
    this.logger.debug('attempting to authorize google');
    const sessionId = this.decodeToken<AccessToken>(this.getTokenFromHeader(auth)).sessionId;
    const client = this.getGoogleClient();
    const veriferValues: CodeVerifierResults = await client.generateCodeVerifierAsync();
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: 'openid https://www.googleapis.com/auth/userinfo.email',
      code_challenge_method: CodeChallengeMethod.S256,
      code_challenge: veriferValues.codeChallenge,
      state: base64url.encode(sessionId),
    });

    try {
      await this.cacheManager.set(redisAuthKeys.AUTH_REQUEST_GOOGLE(sessionId), veriferValues.codeVerifier, (1000 * 60 * 10));
    } catch (error) {
      this.logger.error(`Failed to set google auth code for ${sessionId}`, error);
      throw new InternalServerErrorException('Failed to set google auth code');
    }

    reply.status(302).redirect(authorizeUrl);
  }

  /**
   * Generate an access token.
   * @param request TokenRequestGetDto
   * @returns Promise<string>
   *
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
   */
  async generateClientToken(request: TokenGetRequestDto): Promise<TokenPostResponseDto> {
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

    // Must be after verification
    await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));

    const accessToken = this.jwtService.sign({
      sessionId: crypto.randomUUID().toString(),
    }, {
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
      if (!decodedRefresh.sessionId || decodedRefresh.sessionId !== decodedAccessToken.sessionId) {
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
    const foundUser = await this.dataSource.createQueryBuilder()
        .select('user')
        .from(UserEntity, 'user')
        .where('user.email = :email', { email: request.email })
        .getOne();
    if (foundUser) {
      this.logger.warn(`User ${request.email} already exists`);
      throw new ConflictException('User already exists');
    }
    const userId = (await this.dataSource.createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: request.email,
        emailVerifiedOn: new Date(),
        passwordHash: request.passwordHash,
      })
      .execute()).identifiers[0].id;
      
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
  async login(auth: string, request: LoginPostRequestDto): Promise<LoginPostResponseDto> {
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

    if (!user.emailVerifiedOn) {
      throw new UnprocessableEntityException('Email not verified');
    }

    const clientId = this.decodeToken<AccessToken>(this.getTokenFromHeader(auth)).sub;
    const { accessToken, refreshToken } = this.generateTokens(clientId, user.id);

    this.logger.debug(`Logged in user ${request.email}`);
    return {
      user: {
        id: user.id,
        email: user.email!,
        emailVerifiedOn: user.emailVerifiedOn!.toISOString(),
        name: user.name ?? undefined,
      },
      accessToken: {
        token: accessToken,
        type: 'Bearer',
        expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN,
      },
      refreshToken: {
        token: refreshToken,
        type: 'Bearer',
        expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN,
      }
    };
  }

  /**
   * Generate an access token for the registered email.
   * @param clientId the approved client id
   * @param request emailCode
   * @returns LoginEmailPostResponseDtos
   */
  async loginEmail(auth: string, request: EmailCode): Promise<LoginEmailPostResponseDto> {
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

    const clientId = this.decodeToken<AccessToken>(this.getTokenFromHeader(auth)).sub;
    const { accessToken, refreshToken } = this.generateTokens(clientId, user.id);

    return {
      user: {
        id: user.id,
        email: request.email,
        emailVerifiedOn: user.emailVerifiedOn!.toISOString(),
      },
      accessToken: {
        token: accessToken,
        type: 'Bearer',
        expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN,
      },
      refreshToken: {
        token: refreshToken,
        type: 'Bearer',
        expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN,
      }
    };
  }

  async loginGoogle(clientToken: string, request: LoginGooglePostRequestDto): Promise<LoginGooglePostResponseDto> {
    this.logger.debug(`Attempting to login user with google`);
    const client = this.getGoogleClient();
    const sessionId = this.decodeToken<AccessToken>(this.getTokenFromHeader(clientToken)).sessionId;
    const codeVerifier = await this.cacheManager.get<string>(redisAuthKeys.AUTH_REQUEST_GOOGLE(sessionId));
    
    if (!codeVerifier) {
      throw new NotFoundException('Auth code not found');
    }

    const result = await client.getToken({
      code: request.authCode,
      codeVerifier: codeVerifier,
    });

    type GoogleToken = {
      iss: string,
      azp: string,
      aud: string,
      sub: string,
      email: string,
      email_verified: boolean,
      at_hash: string,
      iat: number,
      exp: number,
    };
    const idToken = this.decodeToken<GoogleToken>(result.tokens.id_token!);

    if (!idToken.email_verified) {
      //TODO: send out email confirmation
      throw new NotImplementedException('Should send out email verification');
    }

    const user = await this.getOrInsertUser(idToken.email);
    const account = await this.insertAccountForUser(user.id, idToken.sub);
    
    this.insertTokenForAccount(account.id, result.tokens.id_token!, 'id_token', idToken.exp, result.tokens.scope)
      .catch((error) => {
        this.logger.error(`Failed to insert id_token for ${idToken.email}`, error);
      });

    const { accessToken, refreshToken } = this.generateTokens(idToken.azp, user.id);
    
    return {
      user: {
        id: user.id,
        email: user.email!,
        emailVerifiedOn: user.emailVerifiedOn!.toISOString(),
      },
      accessToken: {
        token: accessToken,
        type: 'Bearer',
        expiresIn: AuthService.ACCESS_TOKEN_EXPIRES_IN,
      },
      refreshToken: {
        token: refreshToken,
        type: 'Bearer',
        expiresIn: AuthService.REFRESH_TOKEN_EXPIRES_IN,
      },
    }
  }

  /**
   *  Helper functions
   * */

  private async getOrInsertUser(email: string, passwordHash?: string): Promise<UserEntity> {
    let user = await this.dataSource.createQueryBuilder()
      .select('user')
      .from(UserEntity, 'user')
      .where('user.email = :email', { email: email })
      .getOne();

    if (!user) {
      this.logger.debug(`User not found, creating user`);
      const result = await this.dataSource.createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          email: email,
          emailVerifiedOn: new Date(),
          passwordHash: passwordHash,
        })
        .execute();
      if (result.identifiers.length === 0) {
        throw new InternalServerErrorException('Failed to create user');
      }
      user = {
        id: result.identifiers[0].id,
        email: email,
        emailVerifiedOn: new Date(),
      };
    }

    return user;
  }

  private async insertAccountForUser(userId: string, providerAccountId: string): Promise<AccountEntity>{
    let account = await this.dataSource.createQueryBuilder()
      .select('account')
      .from(AccountEntity, 'account')
      .where('account.userId = :userId', { userId: userId })
      .andWhere('account.type = :type', { type: 'google' })
      .getOne();

    if (!account) {
      this.logger.debug(`Account not found, creating account for user: ${userId}`);
      const accountResult = await this.dataSource.createQueryBuilder()
        .insert()
        .into(AccountEntity)
        .values({
          userId: userId,
          provider: 'google',
          providerAccountId: providerAccountId,
        })
        .execute();
      if (accountResult.identifiers.length === 0) {
        throw new InternalServerErrorException('Failed to insert account');
      }
      account = {
        id: accountResult.identifiers[0].id,
        userId: userId,
        provider: 'google',
        providerAccountId: providerAccountId,
      } as AccountEntity;
    }
    return account;
  }

  private async insertTokenForAccount(
    accountId: string, token: string, tokenType: TokenType, exp: number, scope?: string
  ): Promise<any> {
    this.logger.debug(`Attempting to insert token ${tokenType}`);
    try {
      return await this.dataSource.createQueryBuilder()
      .insert()
      .into(TokenEntity)
      .values({
        accountId: accountId,
        expiresOn: new Date(exp),
        scope: scope,
        token: token,
        type: tokenType
      })
      .execute();
    } catch (error) {
      this.logger.error(`Failed to insert token for account ${accountId}`, error);
      throw new InternalServerErrorException('Failed to insert token');
    }
  }

  private getGoogleClient(): OAuth2Client {
    return new OAuth2Client(
      process.env.AUTH_GOOGLE_CLIENT_ID,
      process.env.AUTH_GOOGLE_CLIENT_SECRET,
      process.env.AUTH_GOOGLE_REDIRECT_URI,
    );
  }

  private generateTokens(clientId: string, userId: string): { accessToken: string, refreshToken: string } {
    const sessionId = crypto.randomUUID().toString();
    const accessToken = this.jwtService.sign({
      userId: userId,
      sessionId: sessionId,
    }, {
      expiresIn: '24h',
      subject: clientId,
    });

    const refreshToken = this.jwtService.sign({
      userId: userId,
      sessionId: sessionId,
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
   * Extract token from header.
   * 
   * Must be used with ClientTokenGuard.
   * 
   * @param authorizationHeader the authorization header
   * @returns the token
   */
  private getTokenFromHeader(authorizationHeader: string): string {
    return authorizationHeader.split(' ')[1];
  }

  private decodeToken<T>(token: string): T {
    return this.jwtService.decode<T>(token);
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
                           href="http://localhost:4200/login/email?code=${encoding}">Confirm Email</mj-button>
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
