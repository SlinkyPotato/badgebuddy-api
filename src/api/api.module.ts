import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { GuildsModule } from './guilds/guilds.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    EventsModule,
    GuildsModule,
    HealthModule
  ],
})
export class ApiModule {}
