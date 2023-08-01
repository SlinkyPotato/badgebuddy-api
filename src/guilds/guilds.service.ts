import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordGuild } from './schemas/discord-guild.schema';
import { Model } from 'mongoose';
import { PostGuildResponseDto } from './dto/post-guild.response.dto';
import { PostGuildRequestDto } from './dto/post-guild.request.dto';
import GetGuildResponseDto from './dto/get-guild.response.dto';

@Injectable()
export class GuildsService {
  constructor(
    @InjectModel(DiscordGuild.name)
    private discordServerModel: Model<DiscordGuild>,
  ) {}

  async create(
    id: string,
    createRegistrationDto: PostGuildRequestDto,
  ): Promise<PostGuildResponseDto> {
    const retrievedDiscordServer = await this.discordServerModel
      .findOne({
        guildId: id,
      })
      .exec();

    if (retrievedDiscordServer) {
      throw new ConflictException('Guild already registered');
    }

    const createdRegistration = new this.discordServerModel();
    createdRegistration.guildId = id;
    createdRegistration.guildName = createRegistrationDto.guildName;
    createdRegistration.roles = {
      poapManagerRoleId: createRegistrationDto.roleId,
    };
    createdRegistration.privateChannelId = createRegistrationDto.channelId;
    createdRegistration.newsChannelId = createRegistrationDto.newsChannelId;
    const result = await createdRegistration.save();
    return {
      guildId: result.guildId,
      _id: result._id.toString(),
    };
  }
  async remove(id: string): Promise<any> {
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
    return;
  }

  async get(id: string): Promise<GetGuildResponseDto> {
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
    getRegistrationResponseDto.roleId = discordServer.roles.poapManagerRoleId;
    getRegistrationResponseDto.channelId = discordServer.privateChannelId;
    getRegistrationResponseDto.newsChannelId = discordServer.newsChannelId;
    return getRegistrationResponseDto;
  }
}
