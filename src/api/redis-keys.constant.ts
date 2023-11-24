/**
 * Redis keys used with caching.
 * The keys are used in the following files:
 * - src/api/events/guards/auth.guard.ts
 * - src/api/events/events.service.ts
 * - src/api/guilds/guilds.service.ts
 *
 * The keys are also used in CACHE INTERCEPTORS.
 * @see https://docs.nestjs.com/techniques/caching#redis
 */
export const redisHttpKeys = {
  GUILDS: (id: string) => `/guilds/${id}`,
  EVENTS_ACTIVE: '/events/active',
  EVENTS_ACTIVE_ID: (id: string) => `/events/active?eventId=${id}`,
  EVENTS_ACTIVE_GUILD: (id: string) => `/events/active?guildId=${id}`,
  EVENTS_ACTIVE_VOICE_CHANNEL: (id: string) =>
    `/events/active?voiceChannelId=${id}`,
  EVENTS_ACTIVE_ORGANIZER: (id: string) => `/events/active?organizerId=${id}`,
  EVENTS_ACTIVE_GUILD_ORGANIZER: (params: any) =>
    `/events/active?organizerId=${params.organizerId}&guildId=${params.guildId}`,
} as const;

/**
 * Redis keys used with pub/sub.
 */
export const redisProcessorKeys = {
  TRACKING_EVENTS_ACTIVE_VOICE_CHANNEL: (id: string) =>
    `tracking:events:active:voiceChannelId:${id}`,
} as const;

export const redisAuthKeys = {
  AUTH_REQUEST: (clientId: string, code: string) => `auth:request:${clientId}:${code}`,
} as const;