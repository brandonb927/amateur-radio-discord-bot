import { Client, GatewayIntentBits } from 'discord.js';
import config from './utils/config.js';
import { db } from './utils/db.js';
import { loadCommands } from './loadCommands.js';

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client = await loadCommands(client);

// Perform a zero-write to the db in the event the LowDB file has not been created on initialization
await db.write();

client.login(config.token);
