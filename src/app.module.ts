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
import Joi from 'joi';
import { DiscordCommunityEventsActiveModule } from './discord-community-events-active/discord-community-events-active.module';
import { DiscordCommunityEventsManageModule } from './discord-community-events-manage/discord-community-events-manage.module';
import { PoapModule } from './poap/poap.module';

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
        MARIADB_LOGGING: Joi.required(),
        REDIS_HOST: Joi.string().optional(),
        REDIS_PORT: Joi.number().optional(),
        REDIS_CACHE_MIN: Joi.number().required(),
      },
    }),
    CommonTypeOrmModule.forRootAsync(),
    RedisConfigModule.forRootAsync(),
    RedisBullConfigModule.forRootAsync(),
    DiscordConfigModule.forRootAsync(),
    HealthModule,
    AuthModule,
    DiscordBotModule,
    DiscordCommunityEventsManageModule,
    DiscordCommunityEventsActiveModule,
    PoapModule,
  ],
})
export class AppModule {}
