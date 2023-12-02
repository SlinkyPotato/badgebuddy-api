import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { CommonPinoLogger, CommonPinoLoggerService } from '@badgebuddy/common';

async function bootstrap() {
  const pinoLogger = new CommonPinoLogger('api');
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
  
  // app.enableCors({
  //   origin: process.env.CORS_ORIGIN?.split(',') ?? [],
  // });
  // app.enableCors({
  //   origin: '*',
  //   // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   // allowedHeaders: 'Content-Type, Accept, Authorization',
  // })

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
