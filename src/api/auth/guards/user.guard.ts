import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthorizeRequestGetDto } from '../dto/authorize-request-get.dto';

@Injectable()
export class UserGuard implements CanActivate {

  constructor(
    private readonly logger: Logger,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: AuthorizeRequestGetDto = context.switchToHttp().getRequest().query as AuthorizeRequestGetDto;

    // Check DB is user ID exists and is email verified

    return false;
  }
}
