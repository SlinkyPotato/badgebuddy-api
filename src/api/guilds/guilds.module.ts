import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  DiscordGuild,
  DiscordGuildSchema,
} from '@solidchain/badge-buddy-common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
    ConfigModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService, Logger],
  exports: [GuildsService],
})
export class GuildsModule {}
