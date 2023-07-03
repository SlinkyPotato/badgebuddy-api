import 'dotenv/config'; // must be first import
import apm from 'elastic-apm-node/start';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ElasticPinoLogger } from './elasticpino.logger';

async function bootstrap() {
  const pinoLogger = new ElasticPinoLogger(apm);
  apm.logger = pinoLogger.logger;
  apm.startTransaction('bootstrap', 'app');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: pinoLogger.logger,
    }),
    {
      logger: pinoLogger,
    },
  );

  const config = new DocumentBuilder()
    .setTitle('Badge Buddy API')
    .setDescription('The Badge Buddy API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // accept connections to other hosts
  // await app.listen(3000, '0.0.0.0');

  await app.listen(3000);
  apm.endTransaction();
}
bootstrap();
