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
    const headers = context.switchToHttp().getRequest().headers;
    const accessToken = this.extractTokenFromHeader(headers);
    if (!accessToken) {
      this.logger.warn('No access token provided');
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

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.get('Authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
