import 'dotenv/config'; // must be first import
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { winstonLogger } from './winston.logger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV === 'development',
    }),
    {
      logger: winstonLogger,
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
}
bootstrap();
