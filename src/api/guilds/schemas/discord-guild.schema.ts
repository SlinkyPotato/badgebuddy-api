import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'discordGuilds' })
export class DiscordGuild {
  @Prop({ required: true, unique: true })
  guildId: string;

  @Prop({ required: true })
  guildName: string;

  @Prop({ required: true })
  privateChannelId: string;

  @Prop({ required: false })
  newsChannelId: string;

  @Prop({ required: true })
  poapManagerRoleId: string;
}

export type DiscordServerDocument = HydratedDocument<DiscordGuild>;

export const DiscordGuildSchema = SchemaFactory.createForClass(DiscordGuild);
