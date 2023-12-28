import { UserTokenDto } from '@badgebuddy/common';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class UserTokenNoVerifyGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
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
        this.jwtService.decode<UserTokenDto>(accessToken);
      if (!decodedAccessToken.userId) {
        this.logger.warn('Invalid access token');
        return false;
      }
    } catch (error) {
      this.logger.warn('Invalid access token');
      return false;
    }
    return true;
  }
}
