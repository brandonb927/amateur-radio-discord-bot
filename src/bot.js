import Discord from 'discord.js';
import config from './utils/loadConfig.js';
import { getTelemetry } from './modules/getTelemetry.js';
// import { getLocationInfo } from './modules/getLocationInfo.js';
// import { getWeather } from './modules/getWeather.js';

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

client.on(Discord.Events.Error, (e) => {
  console.error(e);
});

client.on(Discord.Events.ClientReady, async () => {
  // const inviteLink = await client
  //   .generateInvite({
  //     permissions: [
  //       Discord.PermissionFlagsBits.AttachFiles,
  //       Discord.PermissionFlagsBits.EmbedLinks,
  //       Discord.PermissionFlagsBits.ReadMessageHistory,
  //       Discord.PermissionFlagsBits.SendMessages,
  //     ],
  //     scopes: [Discord.OAuth2Scopes.Bot],
  //   });
  // console.log(`Invite link: ${inviteLink}`);
  // console.log(
  //   `APRS Bot firing up with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  // );
  console.log(`APRS Bot ready!`);
  client.user.setActivity('Stations', { type: Discord.ActivityType.Watching });
});

/** @param {Discord.Message} message */
client.on(Discord.Events.MessageCreate, (message) => {
  // Prevent botception!
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/\s+/g);
  const command = args.shift().toLowerCase();
  switch (command) {
    // case 'loc':
    //   getLocationInfo(args[0], message);
    //   break;
    // case 'weather':
    // case 'wx':
    //   getWeather(args[0], message);
    //   break;
    case 'telemetry':
      getTelemetry(args[0], args[1], message);
      break;
    //     case 'help':
    //       message.channel.send(
    //         `**Currently available commands**:
    // \`${config.prefix}loc callsign\` to retrieve location information.
    // \`${config.prefix}wx callsign\` to retrieve weather data.`
    //       );
    //       break;
    default:
      break;
  }
});

client.login(config.token);
