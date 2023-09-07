import { Controller, Get } from '@nestjs/common';
import { InjectDiscordClient } from '@discord-nestjs/core';
import { Client } from 'discord.js';

@Controller('test')
export class TestController {
  constructor(@InjectDiscordClient() private readonly discordClient: Client) {}

  @Get()
  async getHello(): Promise<any> {
    const result = await this.discordClient.guilds.fetch('850840267082563596');
    console.log(result);
    console.log(result.members);
    console.log(await result.members.fetch());
    console.log(await result.members.fetch('159014522542096384'));
    console.log(await result.members.fetch('1590145225096384'));
    return result.members.fetch('1590145225096384');
  }
}
