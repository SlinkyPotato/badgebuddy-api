import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException, NotImplementedException, UnauthorizedException, UnprocessableEntityException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  DataSource, Repository,
} from 'typeorm';
import {
  AUTH_EMAIL_VERIFY,
  AUTH_REFRESH_TOKEN,
  AUTH_REQUEST,
  AUTH_REQUEST_DISCORD,
  AUTH_REQUEST_GOOGLE,
  AccessTokenDto,
  AccountEntity,
  AuthorizeDiscordGetResponseDto,
  AuthorizeEmailPostRequestDto,
  AuthorizeGetRequestDto,
  AuthorizeGetResponseDto,
  AuthorizeGoogleGetResponseDto,
  LoginDiscordPostRequestDto,
  LoginDiscordPostResponseDto,
  LoginEmailPostResponseDto,
  LoginGooglePostRequestDto,
  LoginGooglePostResponseDto,
  LoginPostRequestDto,
  LoginPostResponseDto,
  RefreshTokenPostRequestDto,
  RefreshTokenPostResponseDto,
  RegisterPostRequestDto,
  RegisterPostResponseDto,
  TokenEntity,
  TokenGetRequestDto,
  TokenGetResponseDto,
  TokenType,
  UserEntity,
  UserTokenDto,
} from '@badgebuddy/common';
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import base64url from 'base64url';
import { EmailCode } from './pipes/email-code.pipe';
import { CodeChallengeMethod, CodeVerifierResults, OAuth2Client } from 'google-auth-library';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import qs from 'qs';
import { InjectRepository } from '@nestjs/typeorm';

type RedisAuthCode = {
  codeChallengeMethod: string;
  codeChallenge: string;
  scope?: string;
};

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
    private readonly httpService: HttpService,
    @InjectRepository(TokenEntity) private readonly tokenRepository: Repository<TokenEntity>,
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
  async authorize(
    { clientId, codeChallenge, codeChallengeMethod, scope, state }: AuthorizeGetRequestDto
  ): Promise<AuthorizeGetResponseDto> {
    this.logger.log(`attempting to generate auth token for client: ${clientId}`);
    const authCode = crypto.randomBytes(20).toString('hex');

    this.logger.verbose('removing old auth code from cache');
    await this.cacheManager.del(AUTH_REQUEST(clientId, authCode));
    this.logger.verbose('removed old auth code from cache');

    const signed = this.jwtService.sign({
      codeChallengeMethod,
      codeChallenge,
      scope,
    } as RedisAuthCode, {
      expiresIn: '10m',
      subject: clientId,
    });

    this.logger.verbose('setting new auth code in cache');
    await this.cacheManager.set(AUTH_REQUEST(clientId, authCode), signed);
    this.logger.log(`generated auth code ${authCode} for client ${clientId}`);
    return {
      code: authCode,
      state,
    };
  }

  async authorizeEmail({email}: AuthorizeEmailPostRequestDto): Promise<void> {
    this.logger.debug('Attempting to authorize email');

    const emailCode: string = this.genMagicEmailCode(email);
    const mjmlParse = this.genConfirmationEmailHtml(emailCode);
    
    this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'BadgeBuddy Magic Email Link',
      text: 'Please confirm your email.',
      html: mjmlParse.html,
    }).then((info) => {
      this.logger.debug(`Sent mage email code`, info);
    }).catch((error) => {
      this.logger.error(`Failed to send magic email code`, error);
    });
  }

  async authorizeGoogle(auth: string): Promise<AuthorizeGoogleGetResponseDto> {
    this.logger.debug('attempting to authorize google');
    const sessionId = this.decodeToken<AccessTokenDto>(this.getTokenFromHeader(auth)).sessionId;
    const client = this.getGoogleClient();
    const veriferValues: CodeVerifierResults = await client.generateCodeVerifierAsync();
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: 'openid https://www.googleapis.com/auth/userinfo.email',
      code_challenge_method: CodeChallengeMethod.S256,
      code_challenge: veriferValues.codeChallenge,
    });

    try {
      await this.cacheManager.set(AUTH_REQUEST_GOOGLE(sessionId), veriferValues.codeVerifier, (1000 * 60 * 10));
    } catch (error) {
      this.logger.error(`Failed to set google auth code for ${sessionId}`, error);
      throw new InternalServerErrorException('Failed to set google auth code');
    }

    return {
      authorizeUrl: authorizeUrl,
    }
  }

  async authorizeDiscord(auth: string): Promise<AuthorizeDiscordGetResponseDto> {
    this.logger.debug('attempting to authorize discord');
    const sessionId = this.decodeToken<AccessTokenDto>(this.getTokenFromHeader(auth)).sessionId;
    const clientId = this.configService.get('DISCORD_BOT_APPLICATION_ID');
    const scopes = 'email%20applications.commands.permissions.update';
    const redirectUri = encodeURIComponent(this.configService.get('DISCORD_REDIRECT_URI')!);
    const state = crypto.randomBytes(16).toString('hex');
    const authorizeUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`;

    try {
      await this.cacheManager.set(AUTH_REQUEST_DISCORD(sessionId), state, (1000 * 60 * 10));
      this.logger.debug(`Stored discord state for ${sessionId}`);
    } catch (error) {
      this.logger.error(`Failed to set discord auth code for ${sessionId}`, error);
      throw new InternalServerErrorException('Failed to set discord auth code');
    }

    return {
      authorizeUrl: authorizeUrl,
    }
  }

  /**
   * Generate an access token.
   * @param request TokenRequestGetDto
   * @returns Promise<string>
   *
   * @see https://tools.ietf.org/html/rfc6749#section-4.1.3
   */
  async generateClientToken(request: TokenGetRequestDto): Promise<TokenGetResponseDto> {
    this.logger.debug(`Attempting to generate access token for client ${request.clientId}`);
    const cacheAuthCode = await this.cacheManager.get<string>(AUTH_REQUEST(request.clientId, request.code));
    if (!cacheAuthCode) {
      throw new NotFoundException('Auth code not found');
    }
    let verifiedStored: RedisAuthCode;
    try {
      verifiedStored = this.jwtService.verify<RedisAuthCode>(cacheAuthCode);
    } catch (error) {
      await this.cacheManager.del(AUTH_REQUEST(request.clientId, request.code));
      throw new UnprocessableEntityException('Auth code invalid');
    }

    switch (verifiedStored.codeChallengeMethod) {
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
    await this.cacheManager.del(AUTH_REQUEST(request.clientId, request.code));

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
    const decodedAccessToken = this.jwtService.decode<UserTokenDto>(requestAccessToken);
    let decodedRefresh: UserTokenDto;
    try {
      decodedRefresh = this.jwtService.verify<UserTokenDto>(request.refreshToken);
      if (!decodedRefresh.userId || decodedRefresh.sub !== decodedAccessToken.sub || decodedRefresh.iss !== decodedAccessToken.iss || decodedRefresh.userId !== decodedAccessToken.userId) {
        throw new UnprocessableEntityException('Invalid refresh token');
      }
      if (!decodedRefresh.sessionId || decodedRefresh.sessionId !== decodedAccessToken.sessionId) {
        throw new UnprocessableEntityException('Invalid refresh token');
      }
    } catch (error) {
      throw new UnprocessableEntityException('Invalid token invalid');
    }
    const cacheRefreshToken = await this.cacheManager.get<string>(AUTH_REFRESH_TOKEN(decodedRefresh.userId));
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
  async register({email, passwordHash}: RegisterPostRequestDto): Promise<RegisterPostResponseDto> {
    this.logger.debug('Attempting to register user');
    const foundUser = await this.dataSource.createQueryBuilder()
        .select('user.id')
        .from(UserEntity, 'user')
        .where('user.email = :email', { email: email })
        .getOne();

    if (foundUser) {
      this.logger.warn(`User ${foundUser.id} with same email already exists`);
      throw new ConflictException('User already exists');
    }
    const userId = (await this.dataSource.createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        email: email,
        passwordHash: passwordHash,
      })
      .execute()).identifiers[0].id;
    
    const emailCode: string = this.genMagicEmailCode(email);
    const mjmlParse = this.genConfirmationEmailHtml(emailCode);
    
    this.transporter.sendMail({
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Welcome to BadgeBuddy',
      text: 'Please confirm your email.',
      html: mjmlParse.html,
    }).then((info) => {
      this.logger.debug(`Sent confirmation email to userId: ${userId}`, info);
    }).catch((error) => {
      this.logger.error(`Failed to send confirmation email to ${userId}`, error);
    });
    
    this.logger.debug(`Registered user ${userId}`);
    
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
    this.logger.debug(`Attempting to login user`);

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

    const clientId = this.decodeToken<AccessTokenDto>(this.getTokenFromHeader(auth)).sub;
    const { accessToken, refreshToken } = this.generateTokens(clientId, user.id);

    this.logger.debug(`Logged in user ${user.id}`);
    return this.getLoginResponse(user, accessToken, refreshToken);
  }

  /**
   * Generate an access token for the registered email.
   * @param clientId the approved client id
   * @param request emailCode
   * @returns LoginEmailPostResponseDtos
   */
  async loginEmail(auth: string, request: EmailCode): Promise<LoginEmailPostResponseDto> {
    this.logger.debug(`Attempting to verify email code`);
    
    const encoding = await this.cacheManager.get<string>(AUTH_EMAIL_VERIFY(request.email));
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
        this.logger.debug(`Updated user ${user.id} with email verification`);
      }
    } catch(error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed update db');
    }

    await this.cacheManager.del(AUTH_EMAIL_VERIFY(request.email));

    const clientId = this.decodeToken<AccessTokenDto>(this.getTokenFromHeader(auth)).sub;
    const { accessToken, refreshToken } = this.generateTokens(clientId, user.id);
    return this.getLoginResponse(user, accessToken, refreshToken);
  }

  async loginGoogle(clientToken: string, {authCode}: LoginGooglePostRequestDto): Promise<LoginGooglePostResponseDto> {
    this.logger.debug(`Attempting to login user with google`);
    const client = this.getGoogleClient();
    const resultFromHeader = this.getTokenFromHeader(clientToken);
    const decodedClientToken = this.decodeToken<AccessTokenDto>(resultFromHeader);
    const sessionId = decodedClientToken.sessionId;

    if (!sessionId) {
      this.logger.warn(`Session id not used in request for ${sessionId}`)
      throw new InternalServerErrorException('Session id not found');
    }

    const codeVerifier = await this.cacheManager.get<string>(AUTH_REQUEST_GOOGLE(sessionId));
    
    if (!codeVerifier) {
      this.logger.warn(`Code verifier not found for ${sessionId}`)
      throw new NotFoundException('Code verifier not found');
    }

    let tokenResult;
    try {
      tokenResult = await client.getToken({
        code: authCode,
        codeVerifier: codeVerifier,
      });
    } catch (error) {
      this.logger.error(`Failed to get token for ${sessionId}`, error);
      throw new InternalServerErrorException('Failed to get token from google');
    }
    
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
    const idToken = this.decodeToken<GoogleToken>(tokenResult.tokens.id_token!);

    if (!idToken.email_verified) {
      //TODO: send out email confirmation
      throw new NotImplementedException('Should send out email verification');
    }

    const user = await this.getOrInsertUser(idToken.email.trim());
    const account = await this.insertAccountForUser(user.id, idToken.sub, 'google');
    
    this.upsertTokenForAccount(account.id, tokenResult.tokens.id_token!, 'id_token', idToken.exp, tokenResult.tokens.scope)
      .catch((error) => {
        this.logger.error(`Failed to insert id_token for ${user.id}`, error);
      });

    const { accessToken, refreshToken } = this.generateTokens(decodedClientToken.sub, user.id);
    
    this.logger.debug(`Logged in user ${sessionId}`);
    return this.getLoginResponse(user, accessToken, refreshToken);
  }

  async loginDiscord(clientToken: string, {authCode, state}: LoginDiscordPostRequestDto): Promise<LoginDiscordPostResponseDto> {
    this.logger.log(`Attempting to login user with discord`);
    
    const resultFromHeader = this.getTokenFromHeader(clientToken);
    const decodedClientToken = this.decodeToken<AccessTokenDto>(resultFromHeader);
    const sessionId = decodedClientToken.sessionId;
    this.logger.verbose(`processing session ${sessionId} for discord login attempt`);

    if (!sessionId) {
      this.logger.warn(`Session id not used in request for ${sessionId}`)
      throw new InternalServerErrorException('Session id not found');
    }

    const storedState = await this.cacheManager.get<string>(AUTH_REQUEST_DISCORD(sessionId));
    
    if (!storedState) {
      this.logger.warn(`State not found for ${sessionId}`)
      throw new NotFoundException('Session ID for discord login not found');
    }

    if (storedState !== state) {
      this.logger.warn(`State invalid for ${sessionId}`)
      throw new UnauthorizedException('State invalid');
    }
    this.logger.verbose(`found valid state ${storedState} for discord login attempt`)

    type DiscordToken = {
      token_type: string,
      access_token: string,
      expires_in: number,
      refresh_token: string,
      scope: string,
    };

    type DiscordProfile = {
      id: string,
      username: string,
      avatar: string,
      discriminator: string,
      public_flags: number,
      premium_type: number,
      flags: number,
      global_name: string,
      mfa_enabled: boolean,
      locale: string,
      email: string,
      verified: boolean
    }

    let discordToken: DiscordToken;
    let discordProfile: DiscordProfile;
    try {
      const tokenResult = (await firstValueFrom(this.httpService.post<DiscordToken>('https://discord.com/api/oauth2/token', 
      qs.stringify({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.configService.get('DISCORD_REDIRECT_URI'),
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${this.configService.get('DISCORD_BOT_APPLICATION_ID')}:${this.configService.get('DISCORD_CLIENT_SECRET')}`).toString('base64'),
        },
      })));

      if (tokenResult.status !== 200) {
        throw new InternalServerErrorException('Failed to get discord token');
      }

      discordToken = tokenResult.data;

      const profileResult = (await firstValueFrom(this.httpService.get<any>('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `${discordToken.token_type} ${discordToken.access_token}`,
        },
      })));

      if (profileResult.status !== 200) {
        throw new InternalServerErrorException('Failed to get profile');
      }

      discordProfile = profileResult.data;

    } catch (error) {
      this.logger.error(`Failed to get token for ${sessionId}`, error);
      throw new InternalServerErrorException('Failed to get token from discord');
    }
    
    if (!discordProfile.verified) {
      //TODO: send out email confirmation, throw partial update exception
      throw new NotImplementedException('Should send out email verification');
    }

    const user = await this.getOrInsertUser(discordProfile.email);
    const account = await this.insertAccountForUser(user.id, discordProfile.id, 'discord');
    
    this.upsertTokenForAccount(account.id, discordToken.access_token!, 'access_token', discordToken.expires_in, discordToken.scope).catch((error) => {this.logger.error(`Failed to insert access_token for ${user.id}`, error);});
    this.upsertTokenForAccount(account.id, discordToken.refresh_token!, 'refresh_token', undefined, discordToken.scope).catch((error) => {this.logger.error(`Failed to insert refresh_token for ${user.id}`, error);});

    try {
      const idToken = this.jwtService.sign(discordProfile, {
        expiresIn: '7d',
        subject: discordProfile.id,
      });
      const sevenDaysTimestamp = (7 * 24 * 60 * 60 * 1000);
      this.upsertTokenForAccount(account.id, idToken, 'id_token', sevenDaysTimestamp).catch((error) => {this.logger.error(`Failed to insert id_token for ${user.id}`, error);});
    } catch(error) {
      this.logger.error(`Failed to sign id_token for ${user.id}`, error);
    }
    
    const { accessToken, refreshToken } = this.generateTokens(decodedClientToken.sub, user.id, discordProfile.id);
    
    this.logger.log(`Logged in user ${sessionId}`);
    return this.getLoginResponse(user, accessToken, refreshToken);
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
      this.logger.debug(`Created user ${user.id}`);
    }

    return user;
  }

  private getLoginResponse(
    user: UserEntity, accessToken: string, refreshToken: string
  ): { user: any, accessToken: {token: string, type: string, expiresIn: number}, refreshToken: {token: string, type: string, expiresIn: number} } {
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

  private async insertAccountForUser(userId: string, providerAccountId: string, provider: 'google' | 'discord'): Promise<AccountEntity>{
    this.logger.debug(`Attempting to insert account for user: ${userId}`);

    let account = await this.dataSource.createQueryBuilder()
      .select('account.id')
      .from(AccountEntity, 'account')
      .where('account.user_id = :id', { 'id': userId })
      .andWhere('account.provider = :provider', { 'provider': provider })
      .getOne();

    if (!account) {
      this.logger.debug(`Account not found, creating account for user: ${userId}`);
      const accountResult = await this.dataSource.createQueryBuilder()
        .insert()
        .into(AccountEntity)
        .values([{
          userId: userId,
          provider: provider,
          providerAccountId: providerAccountId,
        }])
        .execute();
      if (accountResult.identifiers.length === 0) {
        throw new InternalServerErrorException(`Failed to insert ${provider} account`);
      }
      account = {
        id: accountResult.identifiers[0].id,
        userId: userId,
        provider: provider,
        providerAccountId: providerAccountId,
      } as AccountEntity;
      this.logger.debug(`Linked ${provider} account for user ${userId}`);
    }
    return account;
  }

  private async upsertTokenForAccount(
    accountId: string, token: string, tokenType: TokenType, exp?: number, scope?: string
  ): Promise<TokenEntity> {
    try {
      this.logger.debug(`Attempting to insert token ${tokenType}`);
      const result = await this.tokenRepository.save<TokenEntity>({
        accountId: accountId,
        expiresOn: exp ? new Date(new Date().getTime() + exp) : undefined,
        scope: scope,
        token: token,
        type: tokenType
      });
      this.logger.verbose(`Upserted token ${tokenType} for account ${accountId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to insert ${tokenType} for account`, error);
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

  private generateTokens(
    sub: string, userId: string, discordUserSId?: string | undefined
  ): { accessToken: string, refreshToken: string } {
    const sessionId = crypto.randomUUID().toString();
    
    const accessToken = this.jwtService.sign({
      userId: userId,
      sessionId: sessionId,
      discordUserSId,
    }, {
      expiresIn: '24h',
      subject: sub,
    });

    const refreshToken = this.jwtService.sign({
      userId: userId,
      sessionId: sessionId,
      discordUserSId,
    }, {
      expiresIn: '7d',
      subject: sub,
    });

    this.cacheManager.set(AUTH_REFRESH_TOKEN(userId), refreshToken, (AuthService.REFRESH_TOKEN_EXPIRES_IN * 1000)).then(() =>  {
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
  public getTokenFromHeader(authorizationHeader: string): string {
    return authorizationHeader.split(' ')[1];
  }

  public decodeToken<T>(token: string): T {
    return this.jwtService.decode<T>(token);
  }

  public decodeTokenFromRawString<T>(token: string): T {
    return this.decodeToken<T>(this.getTokenFromHeader(token));
  }

  private genMagicEmailCode(email: string): string {
    const randomHash = crypto.randomBytes(16).toString('base64url');
    const encoding = base64url(`${email}:${randomHash}`);
    const CODE_EXPIRES_IN = 1000 * 60 * 60 * 24; // 24 hours
    
    this.cacheManager.set(AUTH_EMAIL_VERIFY(email), encoding, (CODE_EXPIRES_IN))
      .then(() =>  {
        this.logger.debug(`Set email verification in cache`);
      }).catch((error) => {
        this.logger.error(`Failed to set email verification in cache`, error);
    });
    return encoding;
  }

  private genConfirmationEmailHtml(encoding: string) {
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

  private getMagicEmailLoginHTML(encoding: string) {
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
    
            </mj-text>
            <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
              I hope you enjoy the services provided. Hit the button below to log in. If this wasn't you, please ignore 🤖
            </mj-text>
            <mj-spacer height="75px" />
            <mj-button background-color="#222b45"
                      href="http://localhost:4200/login/email?code=${encoding}">Login</mj-button>
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
