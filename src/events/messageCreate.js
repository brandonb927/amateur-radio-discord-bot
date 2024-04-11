import { Events } from 'discord.js';
import config from '../utils/config.js';
import { getLocationInfo } from '../modules/getLocationInfo.js';
import { getMessages } from '../modules/getMessages.js';
import { getSota } from '../modules/getSota.js';
import { getPota } from '../modules/getPota.js';
import { getWeather } from '../modules/getWeather.js';

export default {
  name: Events.MessageCreate,
  async execute(message) {
    // Prevent botception!
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/\s+/g);
    const command = args.shift().toLowerCase();
    switch (command) {
      case 'location':
      case 'loc':
        await getLocationInfo(args, message);
        break;
      case 'messages':
      case 'msg':
        await getMessages(args, message);
        break;
      case 'sota':
        await getSota(args, message);
        break;
      case 'pota':
        await getPota(args, message);
        break;
      case 'weather':
      case 'wx':
        await getWeather(args, message);
        break;
      case 'help':
        return message.channel.send(
          `**Available commands**:
- \`${config.prefix}loc callsign\` (alias for \`location\`)
- \`${config.prefix}location callsign\` to retrieve location information.
- \`${config.prefix}msg callsign\` (alias for \`messages\`).
- \`${config.prefix}messages callsign\` to retrieve ten latest APRS messages for given callsign.
- \`${config.prefix}pota spots\` to retrieve recent Parks on the Air summit spots.
- [not yet implemented] \`${config.prefix}pota activations\` to retrieve Parks on the Air upcoming activations.
- \`${config.prefix}sota spots\` to retrieve recent Summits on the Air summit spots.
- [not yet implemented] \`${config.prefix}sota activations\` to retrieve Summits on the Air upcoming activations.
- \`${config.prefix}wx callsign\` (alias for \`weather\`)
- \`${config.prefix}weather callsign\` to retrieve weather data.`
        );
      default:
        break;
    }
  },
};
