import { LoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

export class PinoLoggerService implements LoggerService {
  static readonly loggerOptions: LoggerOptions = {
    // formats formatters, messageKey, timestamp options according to ECS
    // https://www.elastic.co/guide/en/ecs-logging/nodejs/current/pino.html
    ...ecsFormat({
      apmIntegration: true,
    }),
    name: 'badge-buddy-api',
  };

  constructor(private readonly pinoLogger: any) {}

  static createLogger(pinoLogger: any): PinoLoggerService {
    return new PinoLoggerService(pinoLogger);
  }

  static createPino() {
    return pino(
      this.loggerOptions,
      pino.destination({
        dest: 'logs/app.log',
        sync: false,
      }),
    );
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
