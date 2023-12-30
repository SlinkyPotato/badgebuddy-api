import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  CommunityEventDiscordEntity,
  CommunityEventParticipantDiscordEntity,
  PoapClaimDiscordEntity, PoapClaimEntity,
  PoapsDistributeDiscordPostRequestDto,
  PoapsDistributeDiscordPostResponseDto,
} from '@badgebuddy/common';
import { DataSource, EntityManager } from 'typeorm';
import { firstValueFrom, retry, timeout } from 'rxjs';
import { HttpService } from '@nestjs/axios';

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
    poapClaimsUrl,
  }: PoapsDistributeDiscordPostRequestDto): Promise<PoapsDistributeDiscordPostResponseDto> {
    this.logger.log(
      `attempting to distribute poaps for community event ${communityEventId}`,
    );
    const communityEvent = await this.dataSource
      .createQueryBuilder()
      .select('dce')
      .from(CommunityEventDiscordEntity, 'dce')
      .where('dce.communityEventId = :id', { id: communityEventId })
      .getOne();

    if (!communityEvent) {
      this.logger.warn(`community event ${communityEventId} not found`);
      throw new NotFoundException(
        `community event ${communityEventId} not found`,
      );
    }

    this.logger.verbose(`community event ${communityEventId} found in db`);

    const participants = await this.dataSource
      .createQueryBuilder()
      .select('p.discord_user_sid')
      .from(CommunityEventParticipantDiscordEntity, 'p')
      .where('p.community_event_id = :id', { id: communityEventId })
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

    let poapLinkIds: { id: string; claimUrl: string }[] = [];
    await this.dataSource.transaction(async (manager) => {
      poapLinkIds = await this.insertPoapClaimsToDb(
        communityEventId,
        poapClaimsUrl,
        manager,
      );

      if (poapLinkIds.length <= 0) {
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
                poapClaimId: poapLinkIds.pop()?.id,
                assignedDiscordUserSId: participant.discord_user_sid,
                assignedOn: new Date(),
              }) as PoapClaimDiscordEntity,
          ),
        )
        .execute();

      if (result.identifiers.length !== participants.length) {
        // todo: revert if 1 fails or report?
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

      // remove remaining poap links
      await manager
        .createQueryBuilder()
        .delete()
        .from(PoapClaimEntity)
        .where('id IN (:...ids)', { ids: poapLinkIds.map((link) => link.id) })
        .execute();
      this.logger.verbose(
        `removed poap links for community event ${communityEventId}`,
      );
    });

    this.logger.log(
      `distributed poaps for community event ${communityEventId}`,
    );
    return {
      poapsDistributed: participants.length,
      poapsRemaining: poapLinkIds.map((poapLink) => poapLink.claimUrl),
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
   * @param poapLinksUrl
   * @param manager - optional transaction manager
   */
  async insertPoapClaimsToDb(
    communityEventId: string,
    poapLinksUrl: string,
    manager?: EntityManager,
  ): Promise<{ id: string; claimUrl: string }[]> {
    this.logger.verbose('found poap links url');
    const poapLinks = await this.parsePoapLinksUrl(poapLinksUrl);
    if (poapLinks.length <= 0) {
      this.logger.warn('No poap links found');
      throw new NotFoundException('No poap links found');
    }
    this.logger.verbose(
      `Saving poap links for event, eventId: ${communityEventId}`,
    );
    const executor = manager ?? this.dataSource;
    const result = await executor
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
      .execute();
    const poapLinkIds = result.identifiers.map((identifier: { id: string }) =>
      identifier.id.toString(),
    );
    this.logger.verbose(
      `Saved poap links for event, eventId: ${communityEventId}, poapLinks: ${poapLinkIds.length}`,
    );
    return poapLinkIds.map((id, index) => ({
      id,
      claimUrl: poapLinks[index].claimUrl,
    }));
  }
}
