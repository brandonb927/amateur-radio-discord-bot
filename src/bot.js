import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import config from './utils/config.js';

const __dirname = import.meta.dirname;

let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = [];

client.commands = new Collection();

const commandsFolderPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsFolderPath).filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = join(commandsFolderPath, file);
  const commandModule = await import(filePath);
  const command = commandModule.default;
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const eventModule = await import(filePath);
  const event = eventModule.default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

try {
  console.log(`Started refreshing ${commands.length} application slash-commands.`);

  const discordApi = new REST().setToken(config.token);

  const data = await discordApi.put(
    Routes.applicationGuildCommands(config.app_id, config.guild_id),
    { body: commands }
  );

  console.log(`Successfully reloaded ${data.length} application slash-commands.`);
} catch (error) {
  console.error(error);
}

client.login(config.token);
