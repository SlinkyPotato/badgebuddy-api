import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { DiscordBotTokenDto } from '@badgebuddy/common';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_DISCORD_BOT_CLIENT_ID_ENV,
  AUTH_DISCORD_BOT_CLIENT_SECRET_ENV,
  AUTH_ENABLED,
} from '@/app.constants';

@Injectable()
export class DiscordBotTokenGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this.configService.get<string>(AUTH_ENABLED) === 'false') {
      this.logger.warn('Auth is disabled');
      return true;
    }
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
      const decodedAccessToken: DiscordBotTokenDto =
        this.jwtService.verify<DiscordBotTokenDto>(accessToken, {
          secret: this.configService.get<string>(
            AUTH_DISCORD_BOT_CLIENT_SECRET_ENV,
          ),
        });
      if (!decodedAccessToken.discordUserSId) {
        this.logger.warn('Invalid discord bot token');
        return false;
      }
      const discordBotClientId = this.configService.get<string>(
        AUTH_DISCORD_BOT_CLIENT_ID_ENV,
      );
      if (
        !decodedAccessToken.sub ||
        decodedAccessToken.sub !== discordBotClientId
      ) {
        this.logger.warn('Unauthorized client tried to access the API');
        return false;
      }
    } catch (error) {
      this.logger.warn('Invalid discord bot access token');
      return false;
    }
    return true;
  }
}
