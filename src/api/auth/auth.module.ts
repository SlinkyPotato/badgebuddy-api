import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [Logger, AuthService],
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.SECRET_ENCRYPT_KEY,
      signOptions: { expiresIn: '30s' },
    }),
  ],
})
export class AuthModule { }
