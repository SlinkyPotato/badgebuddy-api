import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DiscordServerDocument = HydratedDocument<DiscordServer>;

@Schema({ collection: 'discordServers' })
export class DiscordServer {
  @Prop({ required: true, unique: true })
  guildId: string;

  @Prop({ required: true })
  guildName: string;

  @Prop({ required: true })
  privateChannelId: string;

  @Prop({ required: false })
  newsChannelId: string;

  @Prop(
    raw({
      poapManagerRoleId: { type: String, required: true },
    }),
  )
  roles: {
    poapManagerRoleId: string;
  };
}

export const DiscordServerSchema = SchemaFactory.createForClass(DiscordServer);
