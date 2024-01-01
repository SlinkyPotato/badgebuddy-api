import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PoapService } from '@/poap/poap.service';
import {
  PoapsDistributeDiscordPostRequestDto,
  PoapsDistributeDiscordPostResponseDto,
  PoapsStoreDiscordPostRequestDto,
  PoapsStoreDiscordPostResponseDto,
} from '@badgebuddy/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('poaps')
@ApiTags('POAPs')
@UsePipes(ValidationPipe)
export class PoapController {
  constructor(private readonly poapsService: PoapService) {}

  @Post('distribute/discord')
  @ApiResponse({
    type: PoapsDistributeDiscordPostResponseDto,
    description: 'Successfully distributed POAPs',
    status: 200,
  })
  distributeDiscord(@Body() request: PoapsDistributeDiscordPostRequestDto) {
    return this.poapsService.distributeForDiscord(request);
  }

  @Post('store/discord')
  @ApiResponse({
    type: PoapsStoreDiscordPostResponseDto,
    description: 'Successfully stored POAPs',
    status: 200,
  })
  storeDiscord(@Body() request: PoapsStoreDiscordPostRequestDto) {
    return this.poapsService.storeForDiscord(request);
  }
}
