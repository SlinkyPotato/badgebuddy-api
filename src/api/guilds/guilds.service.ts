import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import GetGuildResponseDto from './dto/get/guild.response.dto';
import PostGuildRequestDto from './dto/post/guild.request.dto';
import PostGuildResponseDto from './dto/post/guild.response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DiscordGuild } from '@solidchain/badge-buddy-common';
import { redisHttpKeys } from '../redis-keys.constant';

@Injectable()
export class GuildsService {
  constructor(
    @InjectModel(DiscordGuild.name)
    private discordServerModel: Model<DiscordGuild>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
  ) {}

  async create(
    id: string,
    postGuildRequestDto: PostGuildRequestDto,
  ): Promise<PostGuildResponseDto> {
    this.logger.log('registering guild: ' + id);
    const retrievedDiscordServer = await this.discordServerModel
      .findOne({
        guildId: id,
      })
      .exec();

    if (retrievedDiscordServer) {
      throw new ConflictException('Guild already registered');
    }

    const discordGuild: DiscordGuild = new DiscordGuild();
    discordGuild.guildId = id;
    discordGuild.guildName = postGuildRequestDto.guildName;
    discordGuild.poapManagerRoleId = postGuildRequestDto.poapManagerRoleId;
    discordGuild.privateChannelId = postGuildRequestDto.privateChannelId;
    discordGuild.newsChannelId = postGuildRequestDto.newsChannelId;

    const result = await this.discordServerModel.create(discordGuild);
    this.logger.log(`registered guild: ${id}`);
    return {
      _id: result._id.toString(),
    };
  }
  async remove(guildId: string): Promise<any> {
    this.logger.log(`removing guild: ${guildId}`);
    const result = await this.discordServerModel
      .findOneAndDelete({
        guildId: guildId,
      })
      .exec();
    if (result == null) {
      throw new NotFoundException('Guild not found');
    }
    this.logger.log(`removing guild from cache: ${guildId}`);
    await this.cacheManager.del(redisHttpKeys.GUILDS(guildId));
    this.logger.log(`removed guild from cache: ${guildId}`);
    return;
  }

  async get(id: string): Promise<GetGuildResponseDto> {
    this.logger.verbose(`getting guild from db, guildId: ${id}`);
    const discordServer = await this.discordServerModel
      .findOne({ guildId: id })
      .exec();
    if (!discordServer) {
      throw new NotFoundException('Guild not found');
    }
    const getGuildResponseDto = new GetGuildResponseDto();
    getGuildResponseDto._id = discordServer._id.toString();
    getGuildResponseDto.guildId = discordServer.guildId;
    getGuildResponseDto.guildName = discordServer.guildName;
    getGuildResponseDto.poapManagerRoleId = discordServer.poapManagerRoleId;
    getGuildResponseDto.privateChannelId = discordServer.privateChannelId;
    getGuildResponseDto.newsChannelId = discordServer.newsChannelId;
    this.logger.verbose(`got guild from db, guildId: ${id}`);
    return getGuildResponseDto;
  }
}
