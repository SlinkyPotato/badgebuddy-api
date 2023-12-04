import { Logger, Module, ValidationPipe } from '@nestjs/common';
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
} from '@badgebuddy/common';
import { ValidateGetActiveEventsQueryPipe } from './pipes/validate-get-active-events-query.pipe';
import { AuthGuard } from './guards/auth.guard';
import { EventController } from './event.controller';

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
  controllers: [EventsController, EventController],
  providers: [
    Logger,
    EventsService,
    ValidateGetActiveEventsQueryPipe,
    ValidationPipe,
    AuthGuard,
  ],
})
export class DiscordEventsModule {}
