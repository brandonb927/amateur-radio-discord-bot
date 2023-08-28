import { EmbedBuilder } from 'discord.js';
import got from '../utils/got.js';
import config from '../utils/loadConfig.js';
import { DATE_OPTIONS, UNAVAILABLE } from '../utils/enums.js';

export async function getLocationInfo(callsign, message) {
  if (!callsign) {
    return message.channel.send("Hmm, Looks like you didn't provide a callsign. Try again!");
  }

  try {
    const data = await got
      .get(`get?name=${callsign}&what=loc&apikey=${config.aprs_token}&format=json`)
      .json();

    if (!data.found) {
      return message.channel.send(
        "Sorry, I couldn't find that. Please check the callsign and try again."
      );
    } else {
      let lat = data.entries[0].lat;
      let lng = data.entries[0].lng;
      let comment = data.entries[0].comment || UNAVAILABLE;
      let altitude = data.entries[0].altitude
        ? `${data.entries[0].altitude}m (${Math.round(data.entries[0].altitude * 3.28084)}ft)`
        : UNAVAILABLE;
      let coords = `${lat},${lng}`;
      let timeUpdated = new Date(data.entries[0].time * 1000);
      let lastUpdated = new Date(data.entries[0].lasttime * 1000);
      let miniMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coords}&zoom=13&size=600x300&maptype=roadmap&markers=color:red|${coords}&key=${config.gmaps_token}`;
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed_color)
            .addFields([
              { name: 'Coordinates', value: coords },
              { name: 'Altitude', value: altitude },
              { name: 'Beacon comment', value: comment },
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
            ])
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
