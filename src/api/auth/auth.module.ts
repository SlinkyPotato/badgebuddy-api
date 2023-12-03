import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forFeature(() => {
      return {
        validationSchema: Joi.object({
          AUTH_SECRET_ENCRYPT_KEY: Joi.string().required(),
          AUTH_ISSUER: Joi.string().required(),
          AUTH_ALLOWED_CLIENT_IDS: Joi.string().required(),
          MAIL_HOST: Joi.string().required(),
          MAIL_PORT: Joi.number().required(),
          MAIL_USER: Joi.string().required(),
          MAIL_PASS: Joi.string().required(),
          MAIL_FROM: Joi.string().required(),
        }),
      };
    }),
    JwtModule.register({
      secret: process.env.AUTH_SECRET_ENCRYPT_KEY,
      signOptions: {
        expiresIn: '1h',
        issuer: process.env.AUTH_ISSUER,
      },
    }),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [
    Logger,
    AuthService,
  ],
})
export class AuthModule {

  constructor(
    private readonly configService: ConfigService,
  ) {
    if (!this.configService.get<string>('AUTH_SECRET_ENCRYPT_KEY')) {
      throw new Error('Missing AUTH_SECRET_ENCRYPT_KEY');
    }
    if (!this.configService.get<string>('AUTH_ISSUER')) {
      throw new Error('Missing AUTH_ISSUER');
    }
    if (!this.configService.get<string>('AUTH_SECRET_ENCRYPT_KEY')) {
      throw new Error('Missing ALLOWED_CLIENT_IDS');
    }
  }
}
