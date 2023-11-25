import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

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
    const request = context.switchToHttp().getRequest();
    const clientId = request.query.clientId ?? request.body.clientId;

    if (allowedClients.includes(clientId)) {
      return true;
    }
    this.logger.warn(`Unauthorized client tried to access the API`, request);
    return false;
  }
}
