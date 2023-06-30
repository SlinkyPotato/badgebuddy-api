import apm from 'elastic-apm-node/start';
import { utilities, WinstonModule, WinstonModuleOptions } from 'nest-winston';
import winston from 'winston';
import { transport } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import * as fs from 'fs';

// Elasticsearch Transport
const elasticTransport = new ElasticsearchTransport({
  level: 'info',
  apm: apm,
  clientOpts: {
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME ?? '',
      password: process.env.ELASTICSEARCH_PASSWORD ?? '',
    },
    node: {
      url: new URL(process.env.ELASTICSEARCH_URL ?? ''),
    },
    tls: {
      ca: fs.readFileSync(process.env.ELASTICSEARCH_CA ?? ''),
      cert: fs.readFileSync(process.env.ELASTICSEARCH_CERT ?? ''),
      key: fs.readFileSync(process.env.ELASTICSEARCH_KEY ?? ''),
    },
  },
});

// Winston Logger Config
const loggerConfig: WinstonModuleOptions = {
  level: 'info', // Set the desired log level
  format: winston.format.combine(
    winston.format.timestamp(),
    utilities.format.nestLike(),
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    elasticTransport,
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
