import { Module } from '@nestjs/common';
import { DiscordModule } from '@discord-nestjs/core';
import { ReadyEvent } from './ready.event';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [ReadyEvent],
})
export class ReadyModule {}
