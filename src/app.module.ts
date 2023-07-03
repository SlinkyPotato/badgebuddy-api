import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { RegistrationModule } from './registration/registration.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
    EventsModule,
    RegistrationModule,
  ],
  controllers: [AppController],
  providers: [Logger, AppService],
})
export class AppModule {}
