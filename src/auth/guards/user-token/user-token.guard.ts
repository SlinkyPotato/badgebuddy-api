import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import type { UserToken } from '../../auth.service';
import { ConfigService } from '@nestjs/config';
import { ENV_AUTH_ALLOWED_CLIENT_IDS } from '@/app.constants';

@Injectable()
export class UserTokenGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authorizationHeader = context.switchToHttp().getRequest().headers['authorization'];
    if (!authorizationHeader) {
      this.logger.warn('No authorization header provided');
      return false;
    }
    let accessToken: string;
    try {
      accessToken = authorizationHeader.split(' ')[1];
      if (!accessToken) {
        this.logger.warn('No access token provided');
        return false;
      }
    } catch (error) {
      this.logger.warn('No authorization header provided');
      this.logger.error(error);
      return false;
    }
    try {
      const decodedAccessToken: UserToken = this.jwtService.verify<UserToken>(accessToken);
      if (!decodedAccessToken || !decodedAccessToken.userId) {
        this.logger.warn('Invalid user token');
        return false;
      }
      const allowedClients = this.configService.get<string>(ENV_AUTH_ALLOWED_CLIENT_IDS)?.split(',') ?? [];
      if (!allowedClients.includes(decodedAccessToken.sub)) {
        this.logger.warn('Unauthorized client tried to access the API');
        return false;
      }
    } catch (error) {
      this.logger.warn('Invalid user access token');
      return false;
    }
    return true;
  }
}
