import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [
    Logger,
    AuthService,
    ConfigService,
  ],
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_ENCRYPT_KEY,
      signOptions: { expiresIn: '30s' },
    }),
  ],
})
export class AuthModule {
  constructor(private readonly configService: ConfigService) {
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
