import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from '@badgebuddy/common';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.AUTH_SECRET_ENCRYPT_KEY,
      signOptions: {
        expiresIn: '1h',
        issuer: process.env.AUTH_ISSUER,
      },
    }),
    HttpModule,
    TypeOrmModule.forFeature([
      TokenEntity
    ])
  ],
  controllers: [AuthController],
  providers: [
    Logger,
    AuthService,
  ],
  exports: [
    AuthService,
    JwtModule,
  ]
})
export class AuthModule {}
