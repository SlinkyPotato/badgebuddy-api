import { ConflictException, Injectable } from '@nestjs/common';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';
import { InjectModel } from '@nestjs/mongoose';
import { DiscordServer } from './schemas/discord-server.schema';
import { Model } from 'mongoose';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectModel(DiscordServer.name)
    private discordServerModel: Model<DiscordServer>,
  ) {}

  async create(createRegistrationDto: CreateRegistrationDto) {
    const retrievedDiscordServer = await this.discordServerModel
      .findOne({
        serverId: createRegistrationDto.guildId,
      })
      .exec();

    if (retrievedDiscordServer) {
      throw new ConflictException('Server already registered');
    }

    const createdRegistration = new this.discordServerModel();
    createdRegistration.serverId = createRegistrationDto.guildId;
    createdRegistration.name = createRegistrationDto.guildName;
    createdRegistration.roles = {
      authorizedDegenId: createRegistrationDto.authorizedDegenRoleId,
    };
    return createdRegistration.save();
  }

  findAll() {
    return `This action returns all registration`;
  }

  findOne(id: number) {
    return `This action returns a #${id} registration`;
  }

  update(id: number, updateRegistrationDto: UpdateRegistrationDto) {
    return `This action updates a #${id} registration`;
  }

  remove(id: number) {
    return `This action removes a #${id} registration`;
  }
}
