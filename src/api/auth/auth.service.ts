import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthorizeRequestGetDto } from './dto/authorize-request-get.dto';
import { AuthorizeResponseGetDto } from './dto/authorize-response-get.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import crypto from 'crypto';
import { redisAuthKeys } from '../redis-keys.constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenRequestGetDto } from './dto/token-request-get.dto';
import { TokenResponsePostDto } from './dto/token-response-get.dto';
import { RegisterRequestPostDto } from './dto/register-request-post.dto';
import { LoginRequestPostDto } from './dto/login-request-post.dto';
import { LoginResponsePostDto } from './dto/login-response-post.dto';
import {
  DataSource,
} from 'typeorm';
import { UserEntity } from '@badgebuddy/common';
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';


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
   * @returns Promise<AuthorizeResponseGetDto>
   *
   * @see https://tools.ietf.org/html/rfc7636
   */
  async generateAuthCode(request: AuthorizeRequestGetDto): Promise<AuthorizeResponseGetDto> {
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
  async generateAccessToken(request: TokenRequestGetDto): Promise<TokenResponsePostDto> {
    this.logger.debug(`Attempting to generate access token for client ${request.clientId} with auth code ${request.code}`);
    const cacheAuthCode = await this.cacheManager.get<string>(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));
    if (!cacheAuthCode) {
      throw new Error('Auth code not found');
    }
    let verifiedStored: RedisAuthCode;
    try {
      verifiedStored = this.jwtService.verify<RedisAuthCode>(cacheAuthCode);
    } catch (error) {
      await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));
      throw new Error('Auth code invalid');
    }

    await this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));

    switch (verifiedStored.codeChannelMethod) {
      case 's256':
        const codeChallenge = crypto.createHash('sha256').update(request.codeVerifier).digest('hex').toString();
        this.logger.debug(codeChallenge);
        this.logger.debug(verifiedStored.codeChallenge);
        if (codeChallenge !== verifiedStored.codeChallenge) {
          throw new Error('Code challenge invalid');
        }
        break;
      default:
        throw new Error('Code challenge method invalid');
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
  async register(request: RegisterRequestPostDto): Promise<void> {
    this.logger.debug(`Attempting to register user ${request.email}`);

    try {
      await this.dataSource.createQueryBuilder()
        .insert()
        .into(UserEntity)
        .values({
          email: request.email,
          passwordHash: request.passwordHash,
        })
        .execute();
    } catch (error) {
      throw new Error('User already exists');
    }

    // send out email verification
    const randomHash = crypto.randomBytes(16).toString('hex');
    // await this.cacheManager.set(redisAuthKeys.EMAIL_VERIFICATION(request.email), randomHash);


    this.logger.debug(`Registered user ${request.email}`);
  }

  /**
   * Login a user.
   * @param request LoginRequestPostDto
   * @returns Promise<LoginResponsePostDto>
   */
  async login(request: LoginRequestPostDto): Promise<LoginResponsePostDto> {
    this.logger.debug(`Attempting to login user ${request.email}`);

    const user = await this.dataSource.createQueryBuilder()
      .select('user')
      .from(UserEntity, 'user')
      .where('user.email = :email', { email: request.email })
      .andWhere('user.password_hash = :hash', { hash: request.passwordHash })
      .getOne();

    if (!user) {
      throw new Error('User not found');
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

  async test(): Promise<void> {
    const mjmlParse = mjml2html(`
      <mjml>
        <mj-body>
          <mj-section>
            <mj-column>
              <mj-text>
                Hello World!
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `);
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: 'patinobrian@gmail.com',
        subject: 'Hello',
        text: 'Hello world',
        html: mjmlParse.html,
      });
      console.log(info);
    } catch (error) {
      console.log(error);
    }
  }
}
