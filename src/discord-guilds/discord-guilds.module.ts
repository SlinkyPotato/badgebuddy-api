import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildController } from './guild.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { DiscordGuild, DiscordGuildSchema } from '@badgebuddy/common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
    ConfigModule,
  ],
  controllers: [GuildController],
  providers: [GuildsService, Logger],
})
export class DiscordGuildsModule {}
