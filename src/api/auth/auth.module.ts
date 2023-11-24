import { Logger, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [Logger, AuthService],
  imports: [
    JwtModule.register({
      secret: process.env.SECRET_ENCRYPT_KEY,
      signOptions: { expiresIn: '30s' },
    }),
  ],
})
export class AuthModule { }
