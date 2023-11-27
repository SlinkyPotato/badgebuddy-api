import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotAcceptableException, NotFoundException
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
import { VerifyPatchRequestDto } from './dto/verify-patch-request.dto';


type RedisAuthCode = {
  codeChannelMethod: string;
  codeChallenge: string;
};

@Injectable()
export class AuthService {
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
      throw new NotAcceptableException('Auth code invalid');
    }

    await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));

    switch (verifiedStored.codeChannelMethod) {
      case 's256':
        const codeChallenge = crypto.createHash('sha256').update(request.codeVerifier).digest('hex').toString();
        this.logger.debug(codeChallenge);
        this.logger.debug(verifiedStored.codeChallenge);
        if (codeChallenge !== verifiedStored.codeChallenge) {
          throw new NotAcceptableException('Code challenge invalid');
        }
        break;
      default:
        throw new NotAcceptableException('Code challenge method invalid');
    }

    const accessToken = this.jwtService.sign({}, {
      expiresIn: '1h',
      subject: request.clientId,
    });

    const refreshToken = this.jwtService.sign({}, {
      expiresIn: '3h',
      subject: request.clientId,
    });

    this.logger.debug(`Generated access token for client ${request.clientId} with auth code ${request.code}`);
    return {
      tokenType: 'Bearer',
      expiresIn: 3600,
      accessToken,
      refreshToken
    };
  }

  /**
   * Register a user.
   * @param request RegisterRequestPostDto
   * @returns Promise<void>
   */
  async register(request: RegisterPostRequestDto): Promise<RegisterPostResponseDto> {
    this.logger.debug(`Attempting to register user ${request.email}`);
    let userId: string;
    try {
      const result = await this.dataSource.manager.insert(UserEntity, {
        email: request.email,
        passwordHash: request.passwordHash,
      });
      userId = result.identifiers[0].id;
    } catch (error) {
      this.logger.error(error);
      throw new ConflictException('User already exists');
    }

    const randomHash = crypto.randomBytes(16).toString('base64url');
    const encoding = base64url(`${request.email}:${randomHash}`);
    await this.cacheManager.set(redisAuthKeys.AUTH_EMAIL_VERIFY(request.email), encoding, (1000 * 60 * 60 * 24));
    const mjmlParse = this.generateConfirmationEmailHtml(encoding);
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: 'patinobrian@gmail.com',
        subject: 'Welcome to BadgeBuddy',
        text: 'Please confirm your email.',
        html: mjmlParse.html,
      });
      console.log(info);
    } catch (error) {
      this.logger.warn(`Failed to send confirmation email to ${request.email}`);
      this.logger.error(error);
    }

    this.logger.debug(`Registered user ${request.email}`);
    return {
      userId: userId,
    };
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

    const userToken = this.jwtService.sign({}, {
      expiresIn: '24h',
      subject: user.id,
    });

    const refreshToken = this.jwtService.sign({}, {
      expiresIn: '7d',
      subject: user.id,
    });

    this.logger.debug(`Logged in user ${request.email}`);
    return {
      tokenType: 'Bearer',
      expiresIn: 86400,
      accessToken: userToken,
      refreshToken
    };
  }

  async verify(request: VerifyPatchRequestDto): Promise<void> {
    this.logger.debug(`Attempting to verify code`);
    const [requestEmail, requestRandomHash] = base64url.decode(request.code).split(':');
    if (!requestEmail || !requestRandomHash) {
      throw new NotAcceptableException('Email verification invalid');
    }
    const encoding = await this.cacheManager.get<string>(redisAuthKeys.AUTH_EMAIL_VERIFY(requestEmail));
    if (!encoding) {
      throw new NotFoundException('Email verification not found');
    }
    const [email, randomHash] = base64url.decode(encoding).split(':');
    if (email !== requestEmail || randomHash !== requestRandomHash) {
      throw new NotAcceptableException('Email verification invalid');
    }

    try {
      const result = await this.dataSource.createQueryBuilder()
        .update(UserEntity)
        .set({ emailVerified: new Date() })
        .where('email = :email', { email: requestEmail })
        .execute();
      if (result.affected !== 1) {
        throw new Error('Failed update db');
      }
    } catch(error) {
      this.logger.error(error);
      throw new Error('Failed update db');
    }

    await this.cacheManager.del(redisAuthKeys.AUTH_EMAIL_VERIFY(requestEmail));
  }

  async test(): Promise<void> {
    const mjmlParse = this.generateConfirmationEmailHtml('');
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: 'patinobrian@gmail.com',
        subject: 'Welcome to BadgeBuddy',
        text: 'Please confirm your email.',
        html: mjmlParse.html,
      });
      console.log(info);
    } catch (error) {
      console.log(error);
    }
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
                gm fren 👋,
              </mj-text>
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
                Thank you for creating an account on BadeBuddy!
              </mj-text>
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
              I hope you enjoy the services provided. Hit the button to confirm your email. If this wasn't you, please ignore 🤖
              </mj-text>
              <mj-text font-size="16px" color="#222b45" font-family="Open Sans, sans-serif">
              wgmi
              </mj-text>
              <mj-spacer height="75px" />
              <mj-button background-color="#222b45"
                           href="http://localhost:4200/verify?type=email&key=${encoding}"">Confirm Email</mj-button>
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
