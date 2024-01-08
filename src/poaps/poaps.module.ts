import { Logger, Module } from '@nestjs/common';
import { PoapsService } from './poaps.service';
import { PoapsController } from './poaps.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '@/auth/auth.module';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [HttpModule, AuthModule, DiscordModule.forFeature()],
  controllers: [PoapsController],
  providers: [PoapsService, Logger],
  exports: [PoapsService],
})
export class PoapsModule {}
