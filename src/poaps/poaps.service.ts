import { Injectable, Logger } from '@nestjs/common';
import { PoapsDistributeDiscordPostRequestDto } from '@badgebuddy/common';

@Injectable()
export class PoapsService {
  constructor(private readonly logger: Logger) {}

  distributeForDiscord({
    communityEventId,
    poapsLinkUrl,
  }: PoapsDistributeDiscordPostRequestDto) {
    this.logger.log(communityEventId);
    this.logger.log(poapsLinkUrl);
    return 'This action adds a new poap';
  }
}
