import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [EventsModule, RegistrationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
