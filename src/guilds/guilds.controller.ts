import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import GetGuildResponseDto from './dto/get/guild.response.dto';
import PostGuildResponseDto from './dto/post/guild.response.dto';
import PostGuildRequestDto from './dto/post/guild.request.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@ApiTags('guilds')
@Controller('guilds')
@UseInterceptors(CacheInterceptor)
export class GuildsController {
  constructor(
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly guildService: GuildsService,
    private readonly logger: Logger, // @Inject('APM') private readonly apm: Agent,
  ) {}

  @Get(':id')
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
  async get(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<GetGuildResponseDto> {
    // await this.cacheManager.set('test', 'test-value');
    // const testVal = await this.cacheManager.get('test');
    // console.log(testVal);
    return this.guildService.get(id);
  }

  @Post(':id')
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
    @Param('id', ParseIntPipe) id: string,
    @Body() postRegistrationRequestDto: PostGuildRequestDto,
  ): Promise<PostGuildResponseDto> {
    // this.apm.startTransaction('register guild', 'controller');
    const res = this.guildService.create(id, postRegistrationRequestDto);
    // this.apm.endTransaction();
    return res;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a guild by ID.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Guild removed' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.guildService.remove(id);
  }
}
