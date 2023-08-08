import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';
import { CacheManagerOptions } from '@nestjs/cache-manager';

let CacheConfig: CacheManagerOptions & RedisClientOptions;
switch (process.env.NODE_ENV) {
  case 'production':
    CacheConfig = {
      store: redisStore,
      socket: {
        path: '/app/redis/redis.sock',
      },
      database: 0,
      ttl: 1000 * 60 * 60 * 24, // 1 day
    };
    break;
  case 'staging':
    CacheConfig = {
      store: redisStore,
      socket: {
        path: '/app/redis/redis.sock',
      },
      database: 1,
      ttl: 1000 * 60 * 60, // 1 hour
    };
    break;
  default:
    CacheConfig = {
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
      database: 0,
      ttl: 1000 * 60, // 1 minute
    };
}

export default CacheConfig;
