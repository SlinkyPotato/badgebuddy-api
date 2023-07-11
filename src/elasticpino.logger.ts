import { LoggerService } from '@nestjs/common';
import pino, { LoggerOptions } from 'pino';
import ecsFormat from '@elastic/ecs-pino-format';
import { Agent } from 'elastic-apm-node';
import { PinoLogger } from 'nestjs-pino';

export class ElasticPinoLogger extends PinoLogger implements LoggerService {
  constructor(private readonly apm?: Agent | undefined) {
    super({
      pinoHttp: { logger: ElasticPinoLogger.createPino() },
    });
    this.apm = apm;
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
    if (this.apm?.currentTransaction) {
      super.info({
        transactionId: this.apm.currentTraceIds['transaction.id'],
        traceId: this.apm.currentTraceIds['trace.id'],
        spanId: this.apm.currentTraceIds['span.id'],
        message: msg,
        ...(mergingObj as object),
      });
      return;
    }
    super.info(mergingObj, msg, ...args);
  }

  // error(obj: unknown, msg?: string, ...args: any[]): void {
  //   if (this.apm.currentTransaction) {
  //     super.error(
  //       {
  //         transactionId: this.apm.currentTraceIds['transaction.id'],
  //         traceId: this.apm.currentTraceIds['trace.id'],
  //         spanId: this.apm.currentTraceIds['span.id'],
  //       },
  //       msg,
  //       ...args,
  //     );
  //     return;
  //   }
  //   super.error(obj, msg, ...args);
  // }
  //
  // error(message: any, ...optionalParams: any[]): any {
  //   this.error({ ...optionalParams }, message);
  // }
  //
  // warn(message: string) {
  //   if (this.apm.currentTransaction) {
  //     this.pinoLogger.warn(message, {
  //       transactionId: this.apm.currentTraceIds['transaction.id'],
  //       traceId: this.apm.currentTraceIds['trace.id'],
  //       spanId: this.apm.currentTraceIds['span.id'],
  //     });
  //     return;
  //   }
  //   this.pinoLogger.warn(message);
  // }
  // debug(message: string) {
  //   if (this.apm.currentTransaction) {
  //     this.pinoLogger.debug(message, {
  //       transactionId: this.apm.currentTraceIds['transaction.id'],
  //       traceId: this.apm.currentTraceIds['trace.id'],
  //       spanId: this.apm.currentTraceIds['span.id'],
  //     });
  //     return;
  //   }
  //   this.pinoLogger.debug(message);
  // }
  // verbose(message: string) {
  //   if (this.apm.currentTransaction) {
  //     this.pinoLogger.trace(message, {
  //       transactionId: this.apm.currentTraceIds['transaction.id'],
  //       traceId: this.apm.currentTraceIds['trace.id'],
  //       spanId: this.apm.currentTraceIds['span.id'],
  //     });
  //     return;
  //   }
  //   this.pinoLogger.trace(message);
  // }
}
