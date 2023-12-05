import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { DiscordBotGuildSettingsGetRequestDto } from './dto/discord-bot-guild-settings-get-request.dto';
import { DiscordBotSettingsGetResponseDto } from './dto/discord-bot-settings-get-response.dto';

@Controller('discord/guild/bot')
@ApiTags('Discord Bot')
@UseInterceptors(CacheInterceptor)
export class DiscordBotController {
  constructor(
    private readonly discordBotService: DiscordBotService
  ) {}

  @Get('settings')
  getBotSettings(
    @Query() request: DiscordBotGuildSettingsGetRequestDto,
  ): Promise<DiscordBotSettingsGetResponseDto> {
    return this.discordBotService.getBotSettingsForGuild(request);
  }

  @Post()
  create(@Body() createDiscordBotDto: ) {
    return this.discordBotService.setupBotInGuild(createDiscordBotDto);
  }

  @Delete()
  remove(@Param('id') id: string) {
    return this.discordBotService.removeBotFromGuild(+id);
  }
}
