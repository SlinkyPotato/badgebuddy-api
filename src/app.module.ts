import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { RegistrationModule } from './registration/registration.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EventsModule,
    RegistrationModule,
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
