import { AUTH_PROCESSOR_CLIENT_ID_ENV, AUTH_PROCESSOR_CLIENT_SECRET_ENV } from '@/app.constants';
import { AccessTokenDto } from '@badgebuddy/common';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class ProcessorTokenGuard implements CanActivate {

  constructor(
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
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
      const decodedAccessToken: AccessTokenDto = this.jwtService.verify<AccessTokenDto>(accessToken, {
        secret: this.configService.get<string>(AUTH_PROCESSOR_CLIENT_SECRET_ENV),
      });
      if (!decodedAccessToken.sessionId) {
        this.logger.warn('Invalid discord bot token');
        return false;
      }
      const processorClientId = this.configService.get<string>(AUTH_PROCESSOR_CLIENT_ID_ENV);
      if (!decodedAccessToken.sub || decodedAccessToken.sub !== processorClientId) {
        this.logger.warn('Unauthorized client tried to access the API');
        return false;
      }
    } catch (error) {
      this.logger.warn('Invalid processor token');
      return false;
    }
    return true;
  }
}
