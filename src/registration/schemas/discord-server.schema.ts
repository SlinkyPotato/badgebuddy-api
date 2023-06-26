import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DiscordServerDocument = HydratedDocument<DiscordServer>;

@Schema()
export class DiscordServer {
  @Prop({ required: true })
  serverId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  isDEGENSetup: boolean;

  @Prop()
  privateChannelId: string;

  @Prop()
  categoryChannelId: string;

  @Prop()
  announcementChannelId: string;

  @Prop(
    raw({
      authorizedDegenId: { type: String, required: true },
    }),
  )
  roles: {
    authorizedDegenId: string;
  };
}

export const DiscordServerSchema = SchemaFactory.createForClass(DiscordServer);
