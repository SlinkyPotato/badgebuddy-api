import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.SECRET_ENCRYPT_KEY,
    }),
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
    if (!this.configService.get<string>('ALLOWED_CLIENT_IDS')) {
      throw new Error('Missing ALLOWED_CLIENT_IDS');
    }
  }
}
