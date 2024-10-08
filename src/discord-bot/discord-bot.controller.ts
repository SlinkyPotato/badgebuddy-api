import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseInterceptors,
  Query,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { DiscordBotService } from './discord-bot.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Headers } from '@nestjs/common';
import { UserTokenGuard } from '@/auth/guards/user-token/user-token.guard';
import {
  DiscordBotSettingsGetResponseDto,
  DiscordBoSettingsGetRequestDto,
  DiscordBotPostResponseDto,
  DiscordBotPostRequestDto,
  DiscordBotPermissionsPatchRequestDto,
  DiscordBotDeleteRequestDto,
} from '@badgebuddy/common';
import { ProcessorTokenGuard } from '@/auth/guards/processor-token/processor-token.guard';

@Controller('discord/bot')
@ApiTags('Discord Bot')
@UseInterceptors(CacheInterceptor)
@UsePipes(ValidationPipe)
export class DiscordBotController {
  constructor(private readonly discordBotService: DiscordBotService) {}

  @Get('settings')
  @UseGuards(ProcessorTokenGuard)
  @ApiOperation({ summary: 'Retrieve discord bot settings by guildSId' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Discord bot settings found',
    type: DiscordBotSettingsGetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Settings not found',
  })
  getBotSettings(
    @Query() request: DiscordBoSettingsGetRequestDto,
  ): Promise<DiscordBotSettingsGetResponseDto> {
    return this.discordBotService.getBotSettingsForGuild(request);
  }

  @Post()
  @UseGuards(ProcessorTokenGuard)
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
    @Body() request: DiscordBotPostRequestDto,
  ): Promise<DiscordBotPostResponseDto> {
    return this.discordBotService.addBotToGuild(request);
  }

  @Patch('/permissions')
  @UseGuards(UserTokenGuard)
  @ApiOperation({ summary: 'Update discord bot permissions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Discord bot permissions updated',
    type: DiscordBotPostResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Discord bot not found',
  })
  updateBotPermissions(
    @Headers('Authorization') userToken: string,
    @Body() request: DiscordBotPermissionsPatchRequestDto,
  ): Promise<any> {
    return this.discordBotService.updateBotPermissions(userToken, request);
  }

  @UseGuards(ProcessorTokenGuard)
  @Delete()
  @ApiOperation({ summary: 'Remove a guild by guildSId.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Guild removed' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  removeBot(@Body() request: DiscordBotDeleteRequestDto) {
    return this.discordBotService.removeBotFromGuild(request);
  }
}
