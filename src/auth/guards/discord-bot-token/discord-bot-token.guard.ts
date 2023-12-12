import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { DiscordBotTokenDto } from '@badgebuddy/common';
import { ConfigService } from '@nestjs/config';
import { ENV_AUTH_DISCORD_BOT_CLIENT_ID, ENV_AUTH_DISCORD_BOT_CLIENT_SECRET } from '@/app.constants';

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
      const decodedAccessToken: DiscordBotTokenDto = this.jwtService.verify<DiscordBotTokenDto>(accessToken, {
        secret: this.configService.get<string>(ENV_AUTH_DISCORD_BOT_CLIENT_SECRET),
      });
      if (!decodedAccessToken.discordUserSId) {
        this.logger.warn('Invalid discord bot token');
        return false;
      }
      const discordBotClientId = this.configService.get<string>(ENV_AUTH_DISCORD_BOT_CLIENT_ID);
      if (!decodedAccessToken.sub || decodedAccessToken.sub !== discordBotClientId) {
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
