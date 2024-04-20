import { Client, GatewayIntentBits } from 'discord.js';
import config from './utils/config.js';
// import { loadCommands } from './loadCommands.js';

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// client = await loadCommands(client);

client.login(config.token);
