import { EmbedBuilder, Message } from 'discord.js';
import { DATE_OPTIONS } from '../utils/enums.js';
import client from '../utils/http/aprs-fi.js';
import config from '../utils/config.js';

/**
 * Retrieves weather information for a given callsign
 *
 * @param {string[]} args Arguments passed to the given command
 * @param {Message} message Discord message object
 * @returns {Message}
 */
export async function getWeather(args, message) {
  const [callsign] = args;

  if (!callsign) {
    return message.reply("Hmm, Looks like you didn't provide a callsign. Try again!");
  }

  try {
    const data = await client
      .get(`get?what=wx&name=${callsign}&apikey=${config.aprs_token}&format=json`)
      .json();

    if (!data.found) {
      return message.reply("Sorry, I couldn't find that. Please check the callsign and try again.");
    } else {
      let temp = data.entries[0].temp ? `${data.entries[0].temp}C` : null;
      let pressure = data.entries[0].pressure || null;
      let humidity = data.entries[0].humidity || null;
      let wind_direction = data.entries[0].wind_direction || null;
      let wind_speed = data.entries[0].wind_speed || null;
      let wind_gust = data.entries[0].wind_gust || null;
      let rain_1h = data.entries[0].rain_1h ? `${data.entries[0].rain_1h}mm` : null;
      let rain_24h = data.entries[0].rain_24h ? `${data.entries[0].rain_24h}mm` : null;
      let rain_mn = data.entries[0].rain_mn ? `${data.entries[0].rain_mn}mm` : null;
      let luminosity = data.entries[0].luminosity || null;
      let timeUpdated = new Date(data.entries[0].time * 1000);
      let miniMapUrl = `http://www.findu.com/cgi-bin/radar-find.cgi?call=${callsign}`;
      const fields = [
        temp && { name: 'Temp', value: temp },
        pressure && { name: 'Pressure', value: pressure },
        humidity && { name: 'Humidity', value: humidity },
        wind_direction && { name: 'Wind direction', value: wind_direction },
        wind_speed && { name: 'Wind speed', value: wind_speed },
        wind_gust && { name: 'Wind gust', value: wind_gust },
        rain_1h && { name: 'Rainfall past 1hr', value: rain_1h },
        rain_24h && { name: 'Rainfall past 24hrs', value: rain_24h },
        rain_mn && { name: 'Rainfall since midnight', value: rain_mn },
        luminosity && { name: 'Luminosity', value: luminosity },
        {
          name: 'Last updated',
          value: timeUpdated.toLocaleString('en-US', DATE_OPTIONS),
        },
      ].filter(Boolean);

      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed_color)
            .setTitle(`Weather Information For ${callsign}`)
            .addFields(fields)
            .setImage(miniMapUrl)
            .setTimestamp()
            .setFooter({ text: 'Source: https://aprs.fi' }),
        ],
      });
    }
  } catch (error) {
    console.error(error);
    return message.reply(`There was an error retrieving APRS weather information for ${callsign}`);
  }
}
