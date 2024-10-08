import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import { PoapsService } from '@/poaps/poaps.service';
import {
  PoapsDistributeDiscordPostRequestDto,
  PoapsDistributeDiscordPostResponseDto,
  PoapsStoreDiscordPostRequestDto,
  PoapsStoreDiscordPostResponseDto,
  PoapsClaimDiscordGetResponseDto,
} from '@badgebuddy/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PoapManagerGuard } from '@/auth/guards/poap-manager/poap-manager.guard';
import { AuthService } from '@/auth/auth.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('poaps')
@ApiTags('POAPs')
@UsePipes(ValidationPipe)
@UseInterceptors(CacheInterceptor)
export class PoapsController {
  constructor(
    private readonly poapsService: PoapsService,
    private readonly authService: AuthService,
  ) {}

  @Post('distribute/discord')
  @UseGuards(PoapManagerGuard)
  @ApiResponse({
    type: PoapsDistributeDiscordPostResponseDto,
    description: 'Successfully distributed POAPs',
    status: 200,
  })
  distributeDiscord(@Body() request: PoapsDistributeDiscordPostRequestDto) {
    return this.poapsService.distributePoapsForDiscord(request);
  }

  @Post('store/discord')
  @UseGuards(PoapManagerGuard)
  @ApiResponse({
    type: PoapsStoreDiscordPostResponseDto,
    description: 'Successfully stored POAPs',
    status: 200,
  })
  storeDiscord(@Body() request: PoapsStoreDiscordPostRequestDto) {
    return this.poapsService.storePoapsForDiscord(request);
  }

  @Get('claim/discord')
  @ApiResponse({
    type: PoapsClaimDiscordGetResponseDto,
    description: 'Successfully claimed POAPs',
    status: 200,
  })
  claimDiscord(@Headers('Authorization') userAccessToken: string) {
    const discordUserSId =
      this.authService.getDiscordUserSIdFromHeader(userAccessToken);
    return this.poapsService.claimPoapsForDiscord(discordUserSId);
  }
}
