import { varchar, bigint, uniqueIndex } from 'drizzle-orm/mysql-core';
import { snowflake } from '../snowflake.type';
import { bbSchema } from './bb.schema';

export const DiscordGuilds = bbSchema.table(
  'discord_guilds',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
    guildId: snowflake('guild_id', { mode: 'number' }).unique().notNull(),
    name: varchar('name', { length: 100 }),
    newsChannelId: snowflake('news_channel_id', { mode: 'number' }).notNull(),
    poapManagerRoleId: snowflake('poap_manager_role_id', {
      mode: 'number',
    }).notNull(),
    poapCommandChannelId: snowflake('poap_command_channel_id', {
      mode: 'number',
    }).notNull(),
  },
  (guild) => ({
    guildIdIndex: uniqueIndex('guild_id_index').on(guild.id),
    newsChannelIdIndex: uniqueIndex('news_channel_id_index').on(
      guild.newsChannelId,
    ),
    poapManagerRoleIdIndex: uniqueIndex('poap_manager_role_id_index').on(
      guild.poapManagerRoleId,
    ),
    poapCommandChannelIdIndex: uniqueIndex('poap_command_channel_id_index').on(
      guild.poapCommandChannelId,
    ),
  }),
);

export type DiscordGuild = typeof DiscordGuilds.$inferSelect;
export type NewDiscordGuild = typeof DiscordGuilds.$inferInsert;
