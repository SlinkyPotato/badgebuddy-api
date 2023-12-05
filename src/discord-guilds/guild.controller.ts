import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { DiscordGuildsService } from './discord-guilds.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';
import DiscordGuildBotSettingsResponseDto from './dto/discord-guild-get-response.dto';
import PostGuildRequestDto from './dto/discord-guild-post-request.dto';
import PostGuildResponseDto from './dto/discord-guild-post-response.dto';

@Controller('discord/guild')
@ApiTags('Discord Guilds')
@UseInterceptors(CacheInterceptor)
export class GuildController {
  
  constructor(
    private readonly guildService: DiscordGuildsService
  ) { }

  @Get(':id/bot/settings')
  @ApiParam({
    name: 'id',
    description: 'The identifier of the guild given from discord.',
    allowEmptyValue: false,
  })
  @ApiOperation({ summary: 'Retrieve a guild by ID.' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Guild found',
    type: DiscordGuildBotSettingsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  async get(@Param('id') id: string): Promise<DiscordGuildBotSettingsResponseDto> {
    return this.guildService.getGuild(id);
  }

  @Post(':id')
  @ApiParam({
    name: 'id',
    description: 'The identifier of the guild given from discord.',
    allowEmptyValue: false,
  })
  @ApiOperation({ summary: 'Register a guild by ID.' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Guild registered',
    type: PostGuildResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Guild already registered',
  })
  create(
    @Param('id') id: string,
    @Body(ValidationPipe) postGuildRequestDto: PostGuildRequestDto,
  ): Promise<PostGuildResponseDto> {
    return this.guildService.addGuild(id, postGuildRequestDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The identifier of the guild given from discord.',
    allowEmptyValue: false,
  })
  @ApiOperation({ summary: 'Remove a guild by ID.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Guild removed' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  remove(@Param('id') id: string) {
    return this.guildService.removeGuild(id);
  }
}
