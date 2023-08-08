import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  token: process.env.DISCORD_BOT_TOKEN,
  appId: process.env.DISCORD_BOT_APPLICATION_ID,
  publicKey: process.env.DISCORD_BOT_PUBLIC_KEY,
  ownerId: process.env.DISCORD_OWNER_ID,
}));
