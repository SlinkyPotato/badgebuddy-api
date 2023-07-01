import { LoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';

export class PinoLoggerService implements LoggerService {
  // static readonly loggerOptions: LoggerOptions = {
  //   // formats formatters, messageKey, timestamp options according to ECS
  //   // https://www.elastic.co/guide/en/ecs-logging/nodejs/current/pino.html
  //   ...ecsFormat({
  //     apmIntegration: true,
  //   }),
  //   name: 'badge-buddy-api',
  //   transport: {
  //     targets: [
  //       {
  //         level: 'info',
  //         format: 'json',
  //         target: 'poop',
  //         options: {
  //           destination: 'logs/app.log',
  //           sync: false,
  //           mkdir: true,
  //         },
  //       },
  //     ],
  //   },
  // };

  constructor(private readonly pinoLogger: any) {}

  static createLogger(pinoLogger: any): PinoLoggerService {
    return new PinoLoggerService(pinoLogger);
  }

  static createPino() {
    const fileTransport = pino.transport({
      targets: [
        {
          target: 'pino/file',
          level: 'info',
          options: {
            destination: 'logs/app.log',
            sync: false,
            mkdir: true,
          },
        },
        // {
        //   target: 'pino-pretty',
        //   level: 'info',
        //   options: {
        //     destination: '/dev/null',
        //     sync: true,
        //   },
        // },
      ],
    });
    return pino(fileTransport);
    // name: 'badge-buddy-api',
    // ...ecsFormat({
    //   apmIntegration: true,
    // }),
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
