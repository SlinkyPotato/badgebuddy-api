import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { AUTH_ALLOWED_CLIENT_IDS_ENV, AUTH_ENABLED } from '@/app.constants';
import { UserTokenDto } from '@badgebuddy/common';

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
    if (this.configService.get<string>(AUTH_ENABLED) === 'false') {
      this.logger.warn('Auth is disabled');
      return true;
    }
    const authorizationHeader = context.switchToHttp().getRequest<{
      headers: { authorization: string | undefined } | undefined;
    }>().headers?.authorization;
    if (!authorizationHeader) {
      this.logger.warn('No authorization header provided');
      return false;
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      this.logger.warn('No access token provided');
      return false;
    }
    try {
      const decodedAccessToken: UserTokenDto =
        this.jwtService.verify<UserTokenDto>(accessToken);
      if (!decodedAccessToken?.userId) {
        this.logger.warn('Invalid user token');
        return false;
      }
      const allowedClients =
        this.configService
          .get<string>(AUTH_ALLOWED_CLIENT_IDS_ENV)
          ?.split(',') ?? [];
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
