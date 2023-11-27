import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger
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
    let accessToken: string;
    try {
      accessToken = context.switchToHttp().getRequest().headers['authorization'].split(' ')[1];
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
      this.jwtService.verify(accessToken);
      return true;
    } catch (error) {
      this.logger.warn('Invalid access token');
      return false;
    }
  }
}
