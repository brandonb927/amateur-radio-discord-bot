import Discord from 'discord.js';
import got from '../utils/got.js';
import config from '../utils/loadConfig.js';
import { APRS_FI_BASE_URL, DATE_OPTIONS } from '../utils/enums.js';

/**
 * Gets location information for a given callsign
 *
 * @param {string} callsign
 * @param {Discord.Message} message
 */
export async function getLocationInfo(callsign, message) {
  if (!callsign) {
    return message.reply("Hmm, looks like you didn't provide a callsign. Try again!");
  }

  try {
    const data = await got
      .get(
        `${APRS_FI_BASE_URL}/get?name=${callsign}&what=loc&apikey=${config.aprs_fi_token}&format=json`
      )
      .json();

    if (!data.found) {
      return message.channel.send(
        "Sorry, I couldn't find that. Please check the callsign and try again."
      );
    } else {
      let lat = data.entries[0].lat;
      let lng = data.entries[0].lng;
      let comment = data.entries[0].comment || null;
      let altitude = data.entries[0].altitude
        ? `${data.entries[0].altitude}m (${Math.round(data.entries[0].altitude * 3.28084)}ft)`
        : null;
      let coords = `${lat},${lng}`;
      let timeUpdated = new Date(data.entries[0].time * 1000);
      let lastUpdated = new Date(data.entries[0].lasttime * 1000);
      let miniMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&zoom=13&size=600x300&maptype=roadmap&markers=color:red|${coords}&key=${config.gmaps_token}`;
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
          name: 'GMaps',
          value: `https://www.google.com/maps/search/?api=1&query=${coords}`,
        },
      ].filter(Boolean);
      message.channel.reply({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor(config.embed_color)
            .addFields(fields)
            .setImage(miniMapUrl)
            .setTimestamp()
            .setFooter({ text: 'Source: https://aprs.fi' }),
        ],
      });
    }
  } catch (error) {
    return console.error(error);
  }
}
