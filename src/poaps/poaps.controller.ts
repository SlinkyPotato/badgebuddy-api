import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PoapsService } from '@/poaps/poaps.service';
import { PoapsDistributeDiscordPostRequestDto } from '@badgebuddy/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('poaps')
@ApiTags('POAPs')
@UsePipes(ValidationPipe)
export class PoapsController {
  constructor(private readonly poapsService: PoapsService) {}

  @Post('distribute/discord')
  distributeDiscord(@Body() request: PoapsDistributeDiscordPostRequestDto) {
    return this.poapsService.distributeForDiscord(request);
  }
}
