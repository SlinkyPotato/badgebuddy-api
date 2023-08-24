import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from './schemas/discord-guild.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
    ConfigModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService, Logger],
})
export class GuildsModule {}
