import { EmbedBuilder, Message } from 'discord.js';
import { DATE_OPTIONS } from '../utils/enums.js';
import { getAprsFiCallsignTrackingUrl } from '../utils/getAprsFiCallsignTrackingUrl.js';
import { getIconURLFromSymbol } from '../utils/getIconFromsymbol.js';
import client from '../utils/http/aprs-fi.js';
import config from '../utils/config.js';

/**
 * Retrieves location information for a given callsign
 *
 * @param {string[]} args Arguments passed to the given command
 * @param {Message} message Discord message object
 * @returns {Message}
 */
export async function getLocationInfo(args, message) {
  const [callsign] = args;

  if (!callsign) {
    return message.channel.send("Hmm, Looks like you didn't provide a callsign. Try again!");
  }

  try {
    const data = await client
      .get(`get?what=loc&name=${callsign}&apikey=${config.aprs_token}&format=json`)
      .json();

    if (!data.found) {
      return message.reply("Sorry, I couldn't find that. Please check the callsign and try again.");
    } else {
      const symbol = data.entries[0].symbol;
      const lat = data.entries[0].lat;
      const lng = data.entries[0].lng;
      const comment = data.entries[0].comment || null;
      const altitude = data.entries[0].altitude
        ? `${data.entries[0].altitude}m (${Math.round(data.entries[0].altitude * 3.28084)}ft)`
        : null;
      const coords = `${lat},${lng}`;
      const timeUpdated = new Date(data.entries[0].time * 1000);
      const lastUpdated = new Date(data.entries[0].lasttime * 1000);

      const iconSymbol = getIconURLFromSymbol(symbol);
      const miniMapUrl = new URL('https://maps.googleapis.com/maps/api/staticmap');
      miniMapUrl.searchParams.set('center', coords);
      miniMapUrl.searchParams.set('zoom', 13);
      miniMapUrl.searchParams.set('size', '600x300');
      miniMapUrl.searchParams.set('maptype', 'roadmap');
      miniMapUrl.searchParams.set(
        'markers',
        `${iconSymbol ? `icon:${iconSymbol}|anchor:center` : 'color:red'}|${coords}`
      );
      miniMapUrl.searchParams.set('key', config.gmaps_token);

      const fields = [
        { name: 'Coordinates', value: coords },
        altitude && { name: 'Altitude', value: altitude },
        comment && { name: 'Beacon comment', value: comment },
        {
          name: 'First Beacon at position',
          value: timeUpdated.toLocaleString('en-US', DATE_OPTIONS),
        },
        {
          name: 'Last Beacon at position',
          value: lastUpdated.toLocaleString('en-US', DATE_OPTIONS),
        },
        {
          name: 'Track on APRS.fi',
          value: `${getAprsFiCallsignTrackingUrl(callsign)}`,
        },
      ].filter(Boolean);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed_color)
            .setTitle(`Location Information For ${callsign}`)
            .addFields(fields)
            .setImage(miniMapUrl.toString())
            .setTimestamp()
            .setFooter({ text: 'Source: https://aprs.fi' }),
        ],
      });
    }
  } catch (error) {
    console.error(error);
    return message.reply(`There was an error retrieving APRS information for ${callsign}`);
  }
}
