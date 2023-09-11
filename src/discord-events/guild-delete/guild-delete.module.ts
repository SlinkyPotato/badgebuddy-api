import { Module } from '@nestjs/common';
import { GuildDeleteEvent } from './guild-delete.event';
import { GuildsModule } from '../../api/guilds/guilds.module';

@Module({
  imports: [GuildsModule],
  providers: [GuildDeleteEvent],
})
export class GuildDeleteModule {}
