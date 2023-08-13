import 'dotenv/config'; // must be first import
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PinoLoggerService } from './logger/pino-logger.service';
import { PinoConfigLogger } from './logger/pino-config.logger';

async function bootstrap() {
  const pinoLogger = new PinoConfigLogger();
  const pinoLoggerService = new PinoLoggerService(pinoLogger);
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
