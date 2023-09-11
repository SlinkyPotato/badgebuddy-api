import { Module } from '@nestjs/common';
import { GuildDeleteModule } from './guild-delete/guild-delete.module';

@Module({
  imports: [GuildDeleteModule],
  providers: [],
})
export class DiscordEventsModule {}
