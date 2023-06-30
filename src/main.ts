import 'dotenv/config'; // must be first import
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { pinoLogger } from './pino.logger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: pinoLogger,
    }),
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

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
}
bootstrap();
