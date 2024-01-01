import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CommunityEventDiscordEntity,
  CommunityEventEntity,
  CommunityEventParticipantDiscordEntity,
  PoapClaimDiscordEntity,
  PoapClaimEntity,
  PoapsDistributeDiscordPostRequestDto,
  PoapsDistributeDiscordPostResponseDto,
  PoapsStoreDiscordPostRequestDto,
  PoapsStoreDiscordPostResponseDto,
} from '@badgebuddy/common';
import { DataSource, EntityManager } from 'typeorm';
import { firstValueFrom, retry, timeout } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ResultSetHeader } from 'mysql2';

type PoapLink = {
  qrCode: string | undefined;
  claimUrl: string;
};

@Injectable()
export class PoapService {
  constructor(
    private readonly logger: Logger,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  async distributeForDiscord({
    communityEventId,
  }: PoapsDistributeDiscordPostRequestDto): Promise<PoapsDistributeDiscordPostResponseDto> {
    this.logger.log(
      `attempting to distribute poaps for community event ${communityEventId}`,
    );
    // only fetch events that have disbanded
    const communityEvent = await this.dataSource
      .createQueryBuilder()
      .select('dce')
      .from(CommunityEventDiscordEntity, 'dce')
      .leftJoinAndSelect(
        CommunityEventEntity,
        'ce',
        'ce.id = dce.communityEventId',
      )
      .where('dce.communityEventId = :id', { id: communityEventId })
      .andWhere('ce.disbandedDate IS NOT NULL')
      .getOne();

    if (!communityEvent) {
      this.logger.warn(`community event ${communityEventId} not found`);
      throw new NotFoundException(
        `community event ${communityEventId} not found`,
      );
    }

    this.logger.verbose(`community event ${communityEventId} found in db`);

    // fetch only participants without poap claims
    const participants = await this.dataSource
      .createQueryBuilder()
      .select('participants.discord_user_sid')
      .from(CommunityEventParticipantDiscordEntity, 'participants')
      .leftJoinAndSelect(
        PoapClaimDiscordEntity,
        'claims',
        'participants.discord_user_sid = claims.assigned_discord_user_sid',
      )
      .where('participants.community_event_id = :id', { id: communityEventId })
      .andWhere('claims.assigned_discord_user_sid IS NULL')
      .getRawMany<{ discord_user_sid: string }>();

    if (participants.length <= 0) {
      this.logger.warn(
        `no participants found for community event ${communityEventId}`,
      );
      throw new NotFoundException(
        `no participants found for community event ${communityEventId}`,
      );
    }

    this.logger.verbose(
      `found ${participants.length} participants for community event ${communityEventId}`,
    );

    let poapClaims: { id: string; claimUrl: string }[] = [];

    this.logger.verbose(
      'starting transaction for poap insertion and assigning operations',
    );
    await this.dataSource.transaction(async (manager) => {
      poapClaims = await this.fetchAvailablePoaps(communityEventId, manager);
      if (poapClaims.length <= 0) {
        this.logger.warn(
          `no poap links found for community event ${communityEventId}`,
        );
        throw new NotFoundException(
          `no poap links found for community event ${communityEventId}`,
        );
      }

      this.logger.verbose(
        `attempting to insert poap claims for all participants in community event ${communityEventId}`,
      );
      const result = await manager
        .createQueryBuilder()
        .insert()
        .into(PoapClaimDiscordEntity)
        .values(
          participants.map(
            (participant) =>
              ({
                poapClaimId: poapClaims.pop()?.id,
                assignedDiscordUserSId: participant.discord_user_sid,
                assignedOn: new Date(),
              }) as PoapClaimDiscordEntity,
          ),
        )
        .execute();

      if (result.identifiers.length !== participants.length) {
        this.logger.warn(
          `failed to insert poap claims for all participants in community event ${communityEventId}`,
        );
        throw new UnprocessableEntityException(
          `failed to insert poap claims for community event ${communityEventId}`,
        );
      }

      this.logger.verbose(
        `inserted poap claims for all participants in community event ${communityEventId}`,
      );

      // remove remaining poap claims
      await manager
        .createQueryBuilder()
        .delete()
        .from(PoapClaimEntity)
        .where('id IN (:...ids)', { ids: poapClaims.map((link) => link.id) })
        .execute();
      this.logger.verbose(
        `removed poap links for community event ${communityEventId}`,
      );
    });

    this.logger.log(
      `finished transaction, distributed poaps for community event ${communityEventId}`,
    );
    return {
      poapsDistributed: participants.length,
      poapsRemaining: poapClaims.map((poapLink) => poapLink.claimUrl),
    };
  }

  /**
   * Parses a poap links url and returns an array of poap links
   * @param poapLinksUrl
   */
  async parsePoapLinksUrl(poapLinksUrl: string): Promise<PoapLink[]> {
    const POAP_LINK_REGEX = /^http[s]?:\/\/poap\.xyz\/.*$/i;
    const QR_CLAIM_REGEX = /^http[s]?:\/\/poap\.xyz\/claim\//i;

    this.logger.verbose(`Fetching poap links from url: ${poapLinksUrl}`);
    const contents = await firstValueFrom(
      this.httpService.get<string>(poapLinksUrl).pipe(timeout(500), retry(3)),
    );

    this.logger.verbose(`Fetched poap links from url: ${poapLinksUrl}`);
    const lines: string[] = contents.data.split('\n');
    const poapLinks: PoapLink[] = [];

    this.logger.verbose(`Parsing poap links from url: ${poapLinksUrl}`);

    for (const line of lines) {
      if (!line.match(POAP_LINK_REGEX)) {
        this.logger.verbose(
          `Skipping line, does not contain poap link: ${line}`,
        );
        continue;
      }
      let qrCode: string | undefined;
      try {
        qrCode = line.split(QR_CLAIM_REGEX)[1];
      } catch (e) {
        this.logger.error(`Error parsing poap link: ${line}`, e);
      }
      poapLinks.push({
        qrCode,
        claimUrl: line,
      });
    }
    this.logger.verbose(
      `Finished parsing poap links from url: ${poapLinksUrl}, found ${poapLinks.length} links`,
    );
    return poapLinks;
  }

  /**
   * Inserts poap claims into the database
   * @param communityEventId
   * @param poapLinks - array of poap links
   */
  async insertPoapClaims(
    communityEventId: string,
    poapLinks: PoapLink[],
  ): Promise<ResultSetHeader> {
    if (poapLinks.length <= 0) {
      this.logger.warn('No poap links found');
      throw new NotFoundException('No poap links found');
    }
    this.logger.verbose(
      `Saving poap links for event, eventId: ${communityEventId}`,
    );
    const insertResult: ResultSetHeader = (
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into(PoapClaimEntity)
        .values(
          poapLinks.map((poapLink) => ({
            communityEventId: communityEventId,
            qrCode: poapLink.qrCode,
            claimUrl: poapLink.claimUrl,
          })),
        )
        .orIgnore()
        .execute()
    ).raw as ResultSetHeader;

    this.logger.verbose(`inserted ${insertResult.affectedRows} poap claims`);

    if (insertResult.affectedRows !== poapLinks.length) {
      this.logger.warn(
        `failed to insert all poap links for communityEventId: ${communityEventId}`,
      );
    }
    return insertResult;
  }

  async fetchAvailablePoaps(
    communityEventId: string,
    executor: EntityManager | DataSource,
  ): Promise<{id: string, claimUrl: string}[]> {
    this.logger.verbose(`Fetching available poaps for event, eventId: ${communityEventId}`);
    const result = await executor
      .createQueryBuilder()
      .select('claims.id')
      .addSelect('claims.claim_url')
      .from(PoapClaimEntity, 'claims')
      .leftJoin(
        PoapClaimDiscordEntity,
        'discord_claims',
        'discord_claims.poap_claim_id = claims.id',
      )
      .where('claims.community_event_id = :id', { id: communityEventId })
      .andWhere('discord_claims.poap_claim_id IS NULL')
      .getRawMany<{ claims_id: string; claim_url: string }>();
    this.logger.verbose(`Fetched ${result.length} available poaps for event, eventId: ${communityEventId}`);
    return result.map((claim) => ({
      id: claim.claims_id,
      claimUrl: claim.claim_url,
    }));
  }

  /**
   * Stores poap claims for discord users
   * @param communityEventId
   * @param poapClaimsUrl
   */
  async storeForDiscord({
    communityEventId,
    poapClaimsUrl,
  }: PoapsStoreDiscordPostRequestDto): Promise<PoapsStoreDiscordPostResponseDto> {
    this.logger.log(
      `attempting to store poaps for community event ${communityEventId}`,
    );
    const communityEvent = await this.dataSource
      .createQueryBuilder()
      .select('event.id')
      .from(CommunityEventEntity, 'event')
      .where('event.id = :id', { id: communityEventId })
      .getOne();

    if (!communityEvent) {
      this.logger.warn(`community event ${communityEventId} not found`);
      throw new NotFoundException(
        `community event ${communityEventId} not found`,
      );
    }

    const poapLinks = await this.parsePoapLinksUrl(poapClaimsUrl);

    this.logger.verbose(`community event ${communityEventId} found in db`);
    await this.insertPoapClaims(
      communityEventId,
      poapLinks,
    );
    const poapClaims = await this.fetchAvailablePoaps(communityEventId, this.dataSource);
    return {
      poapsAvailable: poapClaims.map((poapLink) => poapLink.claimUrl),
    };
  }
}
