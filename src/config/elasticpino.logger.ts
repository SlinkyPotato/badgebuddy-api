import { LoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';
import { PinoLogger } from 'nestjs-pino';
import NodeEnvs from './enums/node-envs.enum';

export class ElasticPinoLogger extends PinoLogger implements LoggerService {
  constructor() {
    super({
      pinoHttp: { logger: ElasticPinoLogger.createPino() },
    });
  }

  static createPino(): pino.Logger {
    const { formatters, messageKey, timestamp } = ecsFormat();
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
    if (process.env.NODE_ENV !== NodeEnvs.PRODUCTION) {
      // https://github.com/pinojs/pino-pretty
      targets.push({
        target: 'pino/file',
        options: {
          // timestampKey: '@timestamp',
          // messageKey: 'message',
          // ignore: 'pid,hostname',
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

  log(message: any, ...optionalParams: any[]): any {
    this.info({ ...optionalParams }, message);
  }

  info(mergingObj: unknown, msg?: string, ...args: any[]): void {
    super.info(mergingObj, msg, ...args);
  }
}
