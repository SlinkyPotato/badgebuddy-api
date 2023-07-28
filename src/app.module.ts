import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GuildsModule } from './guilds/guilds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
    EventsModule,
    GuildsModule,
  ],
  controllers: [AppController],
  providers: [Logger, AppService],
})
export class AppModule {}
