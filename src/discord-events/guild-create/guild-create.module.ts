import { Module } from '@nestjs/common';
import { GuildCreateEvent } from './guild-create.event';
import { GuildCreateService } from './guild-create.service';
import { GuildsModule } from '../../api/guilds/guilds.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, GuildsModule],
  providers: [GuildCreateEvent, GuildCreateService],
})
export class GuildCreateModule {}
