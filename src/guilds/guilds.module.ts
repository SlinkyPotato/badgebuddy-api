import { Logger, Module } from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { GuildsController } from './guilds.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiscordServer,
  DiscordServerSchema,
} from './schemas/discord-server.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscordServer.name, schema: DiscordServerSchema },
    ]),
    ConfigModule,
  ],
  controllers: [GuildsController],
  providers: [GuildsService, Logger],
  // providers: [GuildsService, Logger, { provide: 'APM', useValue: apm }],
})
export class GuildsModule {}
