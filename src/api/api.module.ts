import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { GuildsModule } from './guilds/guilds.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [EventsModule, GuildsModule, HealthModule],
})
export class ApiModule {}
