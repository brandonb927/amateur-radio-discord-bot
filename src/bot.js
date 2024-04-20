import * as Sentry from '@sentry/node';
import { Client, GatewayIntentBits } from 'discord.js';
import config from './utils/config.js';
import { loadCommands } from './loadCommands.js';

if (config.sentry_dsn) {
  Sentry.init({
    dsn: config.sentry_dsn,
    environment: config.sentry_env,
  });
  console.log(`Connected to Sentry.io`);
}

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client = await loadCommands(client);

client.login(config.token);
