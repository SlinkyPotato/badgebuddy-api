import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ClientTokenGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private logger: Logger,
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
      const decoded = this.jwtService.verify(accessToken);
      if (!decoded || !decoded.sessionId) {
        throw new UnauthorizedException();
      }
    } catch (error) {
      this.logger.warn('Invalid access token');
      throw new UnauthorizedException();
    }
    return true;
  }
}
