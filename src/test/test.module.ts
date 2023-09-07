import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { DiscordModule } from '@discord-nestjs/core';

@Module({
  imports: [DiscordModule.forFeature()],
  controllers: [TestController],
})
export class TestModule {}
