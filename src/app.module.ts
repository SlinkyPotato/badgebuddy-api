import { Module } from '@nestjs/common';
import {
  CommonConfigModule,
  RedisConfigModule,
  RedisBullConfigModule,
  DiscordConfigModule,
  CommonTypeOrmModule,
} from '@badgebuddy/common';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DiscordBotModule } from './discord-bot/discord-bot.module';
import { DiscordCommunityEventsModule } from './discord-community-events/discord-community-events.module';
import Joi from 'joi';

@Module({
  imports: [
    CommonConfigModule.forRoot({
      validationSchema: {
        AUTH_SECRET_ENCRYPT_KEY: Joi.string().required(),
        AUTH_ISSUER: Joi.string().required(),
        AUTH_ALLOWED_CLIENT_IDS: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        MARIADB_HOST: Joi.string().required(),
        MARIADB_PORT: Joi.number().required(),
        MARIADB_USERNAME: Joi.string().required(),
        MARIADB_PASSWORD: Joi.string().required(),
        MARIADB_DATABASE: Joi.string().required(),
      }
    }),
    CommonTypeOrmModule.forRootAsync(),
    RedisConfigModule.forRootAsync(),
    RedisBullConfigModule.forRootAsync(),
    DiscordConfigModule.forRootAsync(),
    HealthModule,
    AuthModule,
    DiscordBotModule,
    DiscordCommunityEventsModule,
  ],
})
export class AppModule { }
