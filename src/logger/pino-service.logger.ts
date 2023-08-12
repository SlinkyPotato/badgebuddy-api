import { LoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import { PinoLogger } from 'nestjs-pino';
import NodeEnvs from '../config/enums/node-envs.enum';

export class PinoServiceLogger extends PinoLogger implements LoggerService {
  constructor() {
    super({
      pinoHttp: { logger: PinoServiceLogger.createPino() },
    });
  }

  static createPino(): pino.Logger {
    console.log('creating logger...');
    // const { formatters, messageKey, timestamp } = ecsFormat();
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
      {
        target: '@logtail/pino',
        options: {
          sourceToken: process.env.LOGTAIL_TOKEN,
        },
      },
    ];
    if (process.env.NODE_ENV !== NodeEnvs.PRODUCTION) {
      // https://github.com/pinojs/pino-pretty
      targets.push({
        target: 'pino/file',
        options: {},
      });
    }
    return pino({
      name: 'badge-buddy-api',
      level: 'info',
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
