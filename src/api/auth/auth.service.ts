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


type RedisAuthCode = {
  codeChannelMethod: string;
  codeChallenge: string;
  userId: string;
};

@Injectable()
export class AuthService {

  constructor(
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

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
    this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, code));

    const stored: RedisAuthCode = {
      codeChannelMethod: request.codeChallengeMethod,
      codeChallenge: request.codeChallenge,
      userId: request.userId,
    };

    const signed = this.jwtService.sign(stored, {
      secret: this.configService.get<string>('SECRET_ENCRYPT_KEY'),
      expiresIn: '10m',
      subject: request.userId,
    })

    this.cacheManager.set(redisAuthKeys.AUTH_REQUEST(request.clientId, code), signed);
    this.logger.debug(`Generated auth code ${code} for client ${request.clientId}`);
    return {
      code,
    }
  }

  /**
   * Generate an access token.
   * @param clientId string
   * @param code string
   * @returns Promise<string>
   */
  async generateAccessToken(request: TokenRequestGetDto): Promise<TokenResponsePostDto> {
    this.logger.debug(`Attempting to generate access token for client ${request.clientId} with auth code ${request.code}`);
    const stored = await this.cacheManager.get<string>(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));
    if (!stored) {
      throw new Error('Auth code not found');
    }
    const verifiedStored: RedisAuthCode = this.jwtService.verify<RedisAuthCode>(stored, {
      secret: this.configService.get<string>('AUTH_SECRET_ENCRYPT_KEY'),
    });
    if (!verifiedStored) {
      throw new Error('Auth code invalid');
    }

    switch (verifiedStored.codeChannelMethod) {
      case 's256':
        const codeChallenge = crypto.createHash('sha256').update(request.codeVerifier).digest('base64');
        if (codeChallenge !== verifiedStored.codeChallenge) {
          throw new Error('Code challenge invalid');
        }
        break;
      default:
        throw new Error('Code challenge method invalid');
    }

    const accessToken = this.jwtService.sign({}, {
      secret: this.configService.get<string>('AUTH_SECRET_ENCRYPT_KEY'),
      expiresIn: '1h',
      issuer: this.configService.get<string>('AUTH_ISSUER'),
      subject: verifiedStored.userId,
    });

    const refreshToken = this.jwtService.sign({}, {
      secret: this.configService.get<string>('AUTH_SECRET_ENCRYPT_KEY'),
      expiresIn: '1d',
      issuer: this.configService.get<string>('AUTH_ISSUER'),
      subject: verifiedStored.userId,
    });

    this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, request.code));
    this.logger.debug(`Generated access token for client ${request.clientId} with auth code ${request.code}`);
    return {
      tokenType: 'Bearer',
      expiresIn: 3600,
      accessToken,
      refreshToken
    };
  }
}
