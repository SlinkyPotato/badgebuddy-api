import pino from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

export const pinoLogger = pino(
  ecsFormat({
    apmIntegration: false,
  }),
);
