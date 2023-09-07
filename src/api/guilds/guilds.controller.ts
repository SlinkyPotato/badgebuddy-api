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
} from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import GetGuildResponseDto from './dto/get/guild.response.dto';
import PostGuildResponseDto from './dto/post/guild.response.dto';
import PostGuildRequestDto from './dto/post/guild.request.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('guilds')
@Controller('guilds')
@UseInterceptors(CacheInterceptor)
export class GuildsController {
  constructor(private readonly guildService: GuildsService) {}

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The identifier of the guild given from discord.',
    allowEmptyValue: false,
  })
  @ApiOperation({ summary: 'Retrieve a guild by ID.' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Guild found',
    type: GetGuildResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  async get(@Param('id') id: string): Promise<GetGuildResponseDto> {
    return this.guildService.get(id);
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
    @Body() postGuildRequestDto: PostGuildRequestDto,
  ): Promise<PostGuildResponseDto> {
    return this.guildService.create(id, postGuildRequestDto);
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
    return this.guildService.remove(id);
  }
}
