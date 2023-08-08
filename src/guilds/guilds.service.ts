import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordGuild } from './schemas/discord-guild.schema';
import { Model } from 'mongoose';
import GetGuildResponseDto from './dto/get/guild.response.dto';
import PostGuildRequestDto from './dto/post/guild.request.dto';
import PostGuildResponseDto from './dto/post/guild.response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

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
    createRegistrationDto: PostGuildRequestDto,
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

    const guildRegistration = new DiscordGuild();
    guildRegistration.guildId = id;
    guildRegistration.guildName = createRegistrationDto.guildName;
    guildRegistration.poapManagerRoleId = createRegistrationDto.roleId;
    guildRegistration.privateChannelId = createRegistrationDto.channelId;
    guildRegistration.newsChannelId = createRegistrationDto.newsChannelId;

    const result = await this.discordServerModel.create(guildRegistration);
    this.logger.log('registered guild: ' + id);
    return {
      guildId: result.guildId,
      _id: result._id.toString(),
    };
  }
  async remove(id: string): Promise<any> {
    this.logger.log('removing guild: ' + id);
    await this.discordServerModel
      .findOne({
        guildId: id,
      })
      .exec();
    const result = await this.discordServerModel
      .deleteOne({ guildId: id })
      .exec();
    if (result.deletedCount != 1) {
      throw new NotFoundException('Guild not found');
    }
    this.logger.log('removing guild from cache: ' + id);
    await this.cacheManager.del('/guilds/' + id);
    this.logger.log('removed guild from cache: ' + id);
    return;
  }

  async get(id: string): Promise<GetGuildResponseDto> {
    this.logger.log('getting guild: ' + id);
    const discordServer = await this.discordServerModel
      .findOne({ guildId: id })
      .exec();
    if (!discordServer) {
      throw new NotFoundException('Guild not found');
    }
    const getRegistrationResponseDto = new GetGuildResponseDto();
    getRegistrationResponseDto._id = discordServer._id.toString();
    getRegistrationResponseDto.guildId = discordServer.guildId;
    getRegistrationResponseDto.guildName = discordServer.guildName;
    getRegistrationResponseDto.roleId = discordServer.poapManagerRoleId;
    getRegistrationResponseDto.channelId = discordServer.privateChannelId;
    getRegistrationResponseDto.newsChannelId = discordServer.newsChannelId;
    this.logger.log('got guild: ' + id);
    return getRegistrationResponseDto;
  }
}
