import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { GuildsService } from './guilds.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostGuildRequestDto } from './dto/post-guild.request.dto';
import { PostGuildResponseDto } from './dto/post-guild.response.dto';
import GetGuildResponseDto from './dto/get-guild.response.dto';

@ApiTags('guilds')
@Controller('guilds')
export class GuildsController {
  constructor(
    private readonly guildService: GuildsService,
    private readonly logger: Logger, // @Inject('APM') private readonly apm: Agent,
  ) {}

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Guild found',
    type: GetGuildResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Guild not found',
  })
  get(@Param('id') id: string): Promise<GetGuildResponseDto> {
    return this.guildService.get(id.toString());
  }

  @Post(':id')
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
    @Body() postRegistrationRequestDto: PostGuildRequestDto,
  ): Promise<PostGuildResponseDto> {
    // this.apm.startTransaction('register guild', 'controller');
    postRegistrationRequestDto.guildId = id;
    const res = this.guildService.create(postRegistrationRequestDto);
    // this.apm.endTransaction();
    return res;
  }

  @Delete(':id')
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
