import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CommunityEventDiscordEntity,
  CommunityParticipantDiscordEntity,
  PoapsDistributeDiscordPostRequestDto, PoapsDistributeDiscordPostResponseDto
} from '@badgebuddy/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PoapsService {
  constructor(
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
  ) {}

  async distributeForDiscord({
    communityEventId,
    poapClaimsUrl,
  }: PoapsDistributeDiscordPostRequestDto): Promise<PoapsDistributeDiscordPostResponseDto> {
    this.logger.log(`attempting to distribute poaps for community event ${communityEventId}`);
    const communityEvent = await this.dataSource.createQueryBuilder()
      .select('dce')
      .from(CommunityEventDiscordEntity, 'dce')
      .where('dce.communityEventId = :id', { id: communityEventId })
      .getOne();

    if (!communityEvent) {
      this.logger.warn(`community event ${communityEventId} not found`);
      throw new NotFoundException(`community event ${communityEventId} not found`)
    }

    this.logger.verbose(`community event ${communityEventId} found in db`);

    const participants = await this.dataSource.createQueryBuilder()
      .select('p.discord_user_sid')
      .from(CommunityParticipantDiscordEntity, 'p')
      .where('p.community_event_id = :id', { id: communityEventId })
      .getRawMany<string>();

    if (participants.length <= 0) {
      this.logger.warn(`no participants found for community event ${communityEventId}`);
      throw new NotFoundException(`no participants found for community event ${communityEventId}`);
    }

    this.logger.verbose(`found ${participants.length} participants for community event ${communityEventId}`);

    // todo: assign link to participants

    this.logger.log(`distributed poaps for community event ${communityEventId}`);
    return {
      availablePoaps: participants.length,
    };
  }
}
