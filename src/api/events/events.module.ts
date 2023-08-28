import { Logger, Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscordModule } from '@discord-nestjs/core';
import { BullModule } from '@nestjs/bull';
import {
  CommunityEvent,
  CommunityEventSchema,
  DiscordGuild,
  DiscordGuildSchema,
} from '@solidchain/badge-buddy-common';

@Module({
  imports: [
    DiscordModule.forFeature(),
    MongooseModule.forFeature([
      { name: CommunityEvent.name, schema: CommunityEventSchema },
      { name: DiscordGuild.name, schema: DiscordGuildSchema },
    ]),
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  controllers: [EventsController],
  providers: [Logger, EventsService],
})
export class EventsModule {}
