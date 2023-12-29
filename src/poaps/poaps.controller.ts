import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PoapsService } from '@/poaps/poaps.service';
import {
  PoapsDistributeDiscordPostRequestDto,
  PoapsDistributeDiscordPostResponseDto
} from '@badgebuddy/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('poaps')
@ApiTags('POAPs')
@UsePipes(ValidationPipe)
export class PoapsController {
  constructor(private readonly poapsService: PoapsService) {}

  @Post('distribute/discord')
  @ApiResponse({
    type: PoapsDistributeDiscordPostResponseDto,
    description: 'Successfully distributed POAPs',
    status: 200,
  })
  distributeDiscord(@Body() request: PoapsDistributeDiscordPostRequestDto) {
    return this.poapsService.distributeForDiscord(request);
  }
}
