import { utilities, WinstonModule, WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { transport } from 'winston';

const loggerConfig: WinstonModuleOptions = {
  level: 'info', // Set the desired log level
  format: winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(),
  ),
  transports: [
    new winston.transports.Console(), // Log to console
  ],
};
// assert the type of transports to an array of transport
loggerConfig.transports = <transport[]>loggerConfig.transports;

if (process.env.NODE_ENV !== 'production') {
  loggerConfig.transports.push(
    ...[
      new winston.transports.File({
        filename: 'logs/info.log',
        level: 'info',
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
      }),
      new winston.transports.File({
        filename: 'logs/app.log',
      }),
    ],
  );
}

export const winstonLogger = WinstonModule.createLogger(loggerConfig);
