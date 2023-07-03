import { Logger, Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DiscordServer,
  DiscordServerSchema,
} from './schemas/discord-server.schema';
import { ConfigModule } from '@nestjs/config';
import apm from 'elastic-apm-node';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiscordServer.name, schema: DiscordServerSchema },
    ]),
    ConfigModule,
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService, Logger, { provide: 'APM', useValue: apm }],
})
export class RegistrationModule {}
