import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { EventType } from '../enums/event-type.enum';

@Schema({ collection: 'poapEvents' })
export class PoapEvent {
  @Prop({ required: true })
  eventName: string;

  @Prop({ required: true })
  organizerId: string;

  @Prop({ required: true })
  voiceChannelId: string;

  @Prop({ required: true })
  guildId: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  eventType: EventType;

  @Prop({ required: true, default: true })
  isActive: boolean;

  @Prop({
    raw: raw({
      userId: String,
      duration: Number,
      hasClaimed: Boolean,
    }),
    required: false,
  })
  participants: PoapEventParticipant[];
}

type PoapEventParticipant = {
  userId: string;
  duration: number;
  hasClaimed: boolean;
};

export type PoapEventDocument = HydratedDocument<PoapEvent>;

export const PoapEventSchema = SchemaFactory.createForClass(PoapEvent);
