import { Controller, Get, Post, Body, Delete, UseInterceptors, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { DiscordBoSettingsGetRequestDto } from './dto/discord-bot-settings-get-request.dto';
import { DiscordBotSettingsGetResponseDto } from './dto/discord-bot-settings-get-response.dto';
import { DiscordBotPostRequestDto } from './dto/discord-bot-post-request.dto';
import { DiscordBotPostResponseDto } from './dto/discord-bot-post-response.dto';
import { DiscordBotDeleteRequestDto } from './dto/discord-bot-delete-request.dto';

@Controller('discord/bot')
@ApiTags('Discord Bot')
@UseInterceptors(CacheInterceptor)
export class DiscordBotController {
  constructor(
    private readonly discordBotService: DiscordBotService
  ) {}

  @Get('settings')
  @ApiOperation({ summary: 'Retrieve discord bot settings' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Discord bot settings found',
    type: DiscordBotSettingsGetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Settings not found',
  })
  getBotSettings(
    @Query() { guildSId: guildId }: DiscordBoSettingsGetRequestDto,
  ): Promise<DiscordBotSettingsGetResponseDto> {
    return this.discordBotService.getBotSettingsForGuild(guildId);
  }

  @Post()
  @ApiOperation({ summary: 'Add discord bot to guild' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Discord bot added',
    type: DiscordBotPostResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Discord bot already exists',
  })
  addBot(
    @Body() request: DiscordBotPostRequestDto
  ): Promise<DiscordBotPostResponseDto> {
    return this.discordBotService.addBotToGuild(request);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a guild by ID.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Guild removed' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  removeBot(
    @Body() { guildSId, botSettingsId }: DiscordBotDeleteRequestDto,
  ) {
    return this.discordBotService.removeBotFromGuild(guildSId, botSettingsId);
  }
}
