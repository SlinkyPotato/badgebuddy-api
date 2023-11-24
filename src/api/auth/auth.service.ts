import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthorizeRequestGetDto } from './dto/authorize-request-get.dto';
import { AuthorizeResponseGetDto } from './dto/authorize-response-get.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import { redisAuthKeys } from '../redis-keys.constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
    const code = crypto.randomBytes(16).toString('hex');
    this.cacheManager.del(redisAuthKeys.AUTH_REQUEST(request.clientId, code));

    const stored = {
      timestamp: Date.now(),
      codeChannelMethod: request.codeChallengeMethod,
      codeChallenge: request.codeChallenge,
    };

    const signed = this.jwtService.sign(stored, {
      secret: this.configService.get<string>('SECRET_ENCRYPT_KEY'),
      expiresIn: '10m',
    })

    this.cacheManager.set(redisAuthKeys.AUTH_REQUEST(request.clientId, code), signed);
    return {
      code,
    }
  }

}
