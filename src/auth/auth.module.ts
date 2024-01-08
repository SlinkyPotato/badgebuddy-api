import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from '@badgebuddy/common';
import { UserTokenGuard } from './guards/user-token/user-token.guard';
import { DiscordBotTokenGuard } from './guards/discord-bot-token/discord-bot-token.guard';
import { ProcessorTokenGuard } from './guards/processor-token/processor-token.guard';
import { PoapManagerGuard } from '@/auth/guards/poap-manager/poap-manager.guard';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [
    DiscordModule.forFeature(),
    ConfigModule,
    JwtModule.register({
      secret: process.env.AUTH_SECRET_ENCRYPT_KEY,
      signOptions: {
        expiresIn: '1h',
        issuer: process.env.AUTH_ISSUER,
      },
    }),
    HttpModule,
    TypeOrmModule.forFeature([TokenEntity]),
  ],
  controllers: [AuthController],
  providers: [
    Logger,
    AuthService,
    UserTokenGuard,
    DiscordBotTokenGuard,
    ProcessorTokenGuard,
    PoapManagerGuard,
  ],
  exports: [
    ConfigModule,
    AuthService,
    JwtModule,
    UserTokenGuard,
    DiscordBotTokenGuard,
    ProcessorTokenGuard,
    PoapManagerGuard,
  ],
})
export class AuthModule {}
