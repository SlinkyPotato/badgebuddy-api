import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from '@badgebuddy/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_ALLOWED_CLIENT_IDS_ENV, AUTH_ENABLED } from '@/app.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
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
      throw new UnauthorizedException();
    }

    const accessToken = authorizationHeader.split(' ')[1];

    if (!accessToken) {
      this.logger.warn('No access token provided');
      throw new UnauthorizedException();
    }
    let decodedToken: AccessTokenDto;
    try {
      decodedToken = this.jwtService.verify<AccessTokenDto>(accessToken);
    } catch (error) {
      this.logger.warn('Invalid client token');
      throw new UnauthorizedException();
    }
    if (!decodedToken?.sessionId) {
      throw new UnauthorizedException();
    }
    const allowedClients =
      this.configService.get<string>(AUTH_ALLOWED_CLIENT_IDS_ENV)?.split(',') ??
      [];
    if (!allowedClients.includes(decodedToken.sub)) {
      this.logger.warn('Unauthorized client tried to access the API');
      return false;
    }
    return true;
  }
}
