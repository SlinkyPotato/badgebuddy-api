import { bbSchema } from './bb.schema';
import { bigint, datetime, varchar, int } from 'drizzle-orm/mysql-core';
import { snowflake } from '../snowflake.type';

export const DiscordParticipants = bbSchema.table('discord_participants', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  discordUserId: snowflake('discord_user_id', { mode: 'number' }).notNull(),
  discordCommunityEventId: snowflake('discord_community_event_id', {
    mode: 'number',
  }).notNull(),
  startDate: datetime('start_date', { mode: 'date' }).notNull(),
  endDate: datetime('end_date', { mode: 'date' }).notNull(),
  discordUserTag: varchar('discord_user_tag', { length: 100 }).notNull(),
  durationInMinutes: int('duration_in_minutes').notNull(),
});

export type DiscordParticipant = typeof DiscordParticipants.$inferSelect;
