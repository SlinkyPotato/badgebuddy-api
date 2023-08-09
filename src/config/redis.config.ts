import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { CacheManagerOptions } from '@nestjs/cache-manager';
import { ConfigService, registerAs } from '@nestjs/config';
import ConfigUtil, { JoiConfig } from './config.util';
import Joi from 'joi';
import NodeEnvs from './enums/node-envs.enum';
import { SystemEnv } from './system.config';

type RedisEnv = {
  host: string;
  port: number;
  path: string;
};

export default registerAs('redis', (): RedisEnv => {
  const redisEnvs: JoiConfig<RedisEnv> = {
    host: {
      value: process.env.REDIS_HOST,
      joi: Joi.string().default('localhost'),
    },
    port: {
      value: process.env.REDIS_PORT,
      joi: Joi.number().default(6379),
    },
    path: {
      value: process.env.REDIS_PATH,
      joi: Joi.string().default('/app/redis/redis.sock'),
    },
  };

  return ConfigUtil.validate(redisEnvs);
});

export const configureCache = (configService: ConfigService<any, true>) => {
  let config: CacheManagerOptions & RedisClientOptions;
  switch (configService.get('system.nodeEnv')) {
    case NodeEnvs.PRODUCTION.toString():
      config = {
        store: redisStore,
        socket: {
          path: configService.get<string>('redis.path'),
        },
        database: 0,
        ttl: 1000 * 60 * 60 * 24, // 1 day
      };
      break;
    case NodeEnvs.STAGING.toString():
      config = {
        store: redisStore,
        socket: {
          path: configService.get<string>('redis.path'),
        },
        database: 1,
        ttl: 1000 * 60 * 60, // 1 hour
      };
      break;
    default:
      config = {
        store: redisStore,
        socket: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
        database: 0,
        ttl: 1000 * 60, // 1 minute
      };
  }
  return config;
};
