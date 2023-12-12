import { ENV_AUTH_PROCESSOR_CLIENT_ID, ENV_AUTH_PROCESSOR_CLIENT_SECRET } from '@/app.constants';
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
        secret: this.configService.get<string>(ENV_AUTH_PROCESSOR_CLIENT_SECRET),
      });
      if (!decodedAccessToken.sessionId) {
        this.logger.warn('Invalid discord bot token');
        return false;
      }
      const processorClientId = this.configService.get<string>(ENV_AUTH_PROCESSOR_CLIENT_ID);
      if (!decodedAccessToken.sub || decodedAccessToken.sub !== processorClientId) {
        this.logger.warn('Unauthorized client tried to access the API');
        return false;
      }
    } catch (error) {
      this.logger.warn('Invalid access token');
      return false;
    }
    return true;
  }
}
