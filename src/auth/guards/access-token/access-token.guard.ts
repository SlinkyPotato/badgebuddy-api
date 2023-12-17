import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from '@badgebuddy/common';
import { ConfigService } from '@nestjs/config';
import { AUTH_ALLOWED_CLIENT_IDS_ENV } from '@/app.constants';

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
    const authorizationHeader = context.switchToHttp().getRequest().headers['authorization'];
    if (!authorizationHeader) {
      this.logger.warn('No authorization header provided');
      throw new UnauthorizedException();
    }
    let accessToken: string;
    try {
      accessToken = authorizationHeader.split(' ')[1];
      if (!accessToken) {
        this.logger.warn('No access token provided');
        throw new UnauthorizedException();
      }
    } catch (error) {
      this.logger.warn('No authorization header provided');
      this.logger.error(error);
      throw new UnauthorizedException();
    }
    try {
      const decoded: AccessTokenDto = this.jwtService.verify<AccessTokenDto>(accessToken);
      if (!decoded || !decoded.sessionId) {
        throw new UnauthorizedException();
      }
      const allowedClients = this.configService.get<string>(AUTH_ALLOWED_CLIENT_IDS_ENV)?.split(',') ?? [];
      if (!allowedClients.includes(decoded.sub)) {
        this.logger.warn('Unauthorized client tried to access the API');
        return false;
      }
    } catch (error) {
      this.logger.warn('Invalid client token');
      throw new UnauthorizedException();
    }
    return true;
  }
}
