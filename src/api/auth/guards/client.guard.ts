import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { AuthorizeRequestGetDto } from '../dto/authorize-request-get.dto';

@Injectable()
export class ClientGuard implements CanActivate {

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedClients = this.configService.get<string>('ALLOWED_CLIENT_IDS')?.split(',') ?? [];
    const request: AuthorizeRequestGetDto = context.switchToHttp().getRequest().query as AuthorizeRequestGetDto;

    if (allowedClients.includes(request.clientId)) {
      return true;
    }
    this.logger.warn(`Unauthorized client tried to access the API`, request);
    return false;
  }
}
