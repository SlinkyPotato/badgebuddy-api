import { LoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

export class PinoLogger implements LoggerService {
  constructor(private readonly pinoLogger: any) {}

  static createLogger(pinoLogger: any): PinoLogger {
    return new PinoLogger(pinoLogger);
  }

  static createPino(): pino.Logger {
    // https://github.com/pinojs/pino/blob/32b759d7baa91ae4baa581630f4563195deceee6/lib/levels.js#L16
    // levels taken from pino
    // const levels = {
    //   trace: 10,
    //   debug: 20,
    //   info: 30,
    //   warn: 40,
    //   error: 50,
    //   fatal: 60,
    // };
    // formats formatters, messageKey, timestamp options according to ECS
    // https://www.elastic.co/guide/en/ecs-logging/nodejs/current/pino.html
    const { formatters, messageKey, timestamp } = ecsFormat({
      apmIntegration: true,
    });
    const targets: any = [
      {
        level: 'info', // all logs printed since info does not map
        target: 'pino/file',
        options: {
          destination: './logs/app.log',
          sync: false,
          mkdir: true,
        },
      },
      {
        level: 50,
        target: 'pino/file',
        options: {
          destination: './logs/error.log',
          sync: false,
          mkdir: true,
        },
      },
    ];
    if (process.env.NODE_ENV !== 'production') {
      // https://github.com/pinojs/pino-pretty
      targets.push({
        target: 'pino-pretty',
        options: {
          timestampKey: '@timestamp',
          messageKey: 'message',
        },
      });
    }
    return pino({
      name: 'badge-buddy-api',
      level: 'info',
      timestamp: timestamp,
      messageKey: messageKey,
      formatters: {
        ...formatters?.log,
        ...formatters?.bindings,
      },
      transport: {
        targets: targets,
      },
    } as LoggerOptions);
  }

  log(message: string) {
    this.pinoLogger.info(message);
  }
  error(message: string, trace: string) {
    this.pinoLogger.error(message, trace);
  }
  warn(message: string) {
    this.pinoLogger.warn(message);
  }
  debug(message: string) {
    this.pinoLogger.debug(message);
  }
  verbose(message: string) {
    this.pinoLogger.trace(message);
  }
}
