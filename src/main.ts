import 'dotenv/config'; // must be first import
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import {
  CommonPinoLogger,
  CommonPinoLoggerService,
} from '@solidchain/badge-buddy-common';

async function bootstrap() {
  const pinoLogger = new CommonPinoLogger('badge-buddy-api');
  const pinoLoggerService = new CommonPinoLoggerService(pinoLogger);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: pinoLogger.logger,
    }),
    {
      logger: pinoLoggerService,
    },
  );
  app.useGlobalPipes(new ValidationPipe());
  console.log('something');
  const config = new DocumentBuilder()
    .setTitle('Badge Buddy API')
    .setDescription('API for Badge Buddy to management POAP Events.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // accept connections to other hosts
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
