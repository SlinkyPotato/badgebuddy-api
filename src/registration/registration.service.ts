import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordServer } from './schemas/discord-server.schema';
import { Model } from 'mongoose';
import { PostRegistrationResponseDto } from './dto/post-registration.response.dto';
import { PostRegistrationRequestDto } from './dto/post-registration.request.dto';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(DiscordServer.name)
    private discordServerModel: Model<DiscordServer>,
  ) {}

  async create(
    createRegistrationDto: PostRegistrationRequestDto,
  ): Promise<PostRegistrationResponseDto> {
    const retrievedDiscordServer = await this.discordServerModel
      .findOne({
        guildId: createRegistrationDto.guildId,
      })
      .exec();

    if (retrievedDiscordServer) {
      throw new ConflictException('Server already registered');
    }

    const createdRegistration = new this.discordServerModel();
    createdRegistration.guildId = createRegistrationDto.guildId;
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
      throw new NotFoundException('Server not found');
    }
    return;
  }
}
