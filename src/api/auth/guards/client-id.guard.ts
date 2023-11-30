import { BadRequestException, CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ClientIdGuard implements CanActivate {

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedClients = this.configService.get<string>('AUTH_ALLOWED_CLIENT_IDS')?.split(',') ?? [];
    const request = context.switchToHttp().getRequest();
    const clientId = request.query.clientId ?? request.body.clientId;

    if (!clientId) {
      this.logger.warn(`No client ID provided`, request);
      throw new BadRequestException('No client ID provided');
    }

    if (allowedClients.includes(clientId)) {
      return true;
    }
    this.logger.warn(`Unauthorized client tried to access the API`, request);
    throw new UnauthorizedException();
  }
}
