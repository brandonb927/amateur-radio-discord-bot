import { EmbedBuilder, Message } from 'discord.js';
import { BAND_NAMES, ERROR, mapFrequencyToBandName } from '../utils/enums.js';
import client from '../utils/http/pota-app.js';
import config from '../utils/config.js';

const NUM_SPOTS = 10;

const getEmbed = (spot) =>
  new EmbedBuilder()
    .setColor(config.embed_color)
    .setURL(`https://pota.app/#/park/${spot.reference}`)
    .setTitle(`${spot.activator} @ ${spot.reference}`)
    .addFields(
      [
        {
          name: 'Park',
          value: `${spot.name} (${spot.reference})`,
          inline: true,
        },
        {
          name: 'Frequency',
          value: `${spot.frequency} MHz (${mapFrequencyToBandName(spot.frequency / 1000)}${spot.mode && `, ${spot.mode}`})`,
          inline: true,
        },
        spot.grid6 && {
          name: 'Grid Square',
          value: spot.grid6,
          inline: true,
        },
        spot.comments && {
          name: 'Comments',
          value: spot.comments,
          inline: true,
        },
      ].filter(Boolean)
    )
    .setFooter({
      text: `Spotter: ${spot.spotter} | Last Heard: ${new Date(spot.spotTime).toUTCString()}`,
    });

/**
 * Get recent POTA spots by a given band
 *
 * @param {Message} message Discord message object
 * @param {string} band Selected band to filter results by
 * @returns {Message}
 */
async function getRecentSpotsByBand(message, band) {
  try {
    let data = await client.get(`spot/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current POTA spots
    if (!data.length) {
      return message.reply(`There are no POTA spots for the \`${band}\` band`);
    }

    const filteredData = data
      .filter((spot) => mapFrequencyToBandName(spot.frequency) === band)
      .slice(0, NUM_SPOTS)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    // If there are no spots after filtering by the band, send a message back
    if (!filteredData.length) {
      return message.reply(`There are no POTA spots for the \`${band}\` band`);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      content: `Here are the most recent POTA spots for the \`${band}\` band:`,
      embeds,
    });
  } catch (error) {
    console.error(error);
    return message.reply('There was an error retrieving POTA spots');
  }
}

/**
 * Get recent POTA spots for a given callsign
 *
 * @param {Message} message Discord message object
 * @param {string} callsign Selected callsign to filter results by
 * @returns {Message}
 */
async function getRecentSpotsByCallsign(message, callsign) {
  try {
    let data = await client.get(`spot/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current POTA spots
    if (!data.length) {
      return message.reply('There are no recent POTA spots');
    }

    const filteredData = data
      .filter((spot) => [spot.spotter, spot.activator].includes(callsign))
      .slice(0, NUM_SPOTS)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    // If there are no spots after filtering by the callsign, send a message back
    if (!filteredData.length) {
      return message.reply(`There are no POTA spots for \`${callsign}\``);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      content: `Here are the most recent POTA spots for \`${callsign}\`:`,
      embeds,
    });
  } catch (error) {
    console.error(error);
    return message.reply('There was an error retrieving POTA spots');
  }
}

/**
 * Get `NUM_SPOTS` recent POTA Spots
 *
 * @param {Message} message Discord message object
 * @param {string} arg Argument passed to the given command
 * @returns {Message}
 */
async function getRecentSpots(message, arg) {
  if (arg) {
    if (BAND_NAMES.includes(arg)) {
      return getRecentSpotsByBand(message, arg);
    }

    return getRecentSpotsByCallsign(message, arg);
  }

  // Default no-arg is return recent Spots
  try {
    let data = await client.get(`spot/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current POTA spots
    if (!data.length) {
      return message.reply('There are no recent POTA spots');
    }

    const filteredData = data
      .slice(0, NUM_SPOTS)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    // If for any reason the filtered data is empty, return _something_
    if (!filteredData.length) {
      return message.reply(`There was an error retrieving POTA spots`);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      content: 'Here are the most recent POTA spots:',
      embeds,
    });
  } catch (error) {
    console.error(error);
    return message.reply('There was an error retrieving POTA spots');
  }
}

/**
 * Process POTA command with args
 *
 * @param {string[]} args Arguments passed to the given command
 * @param {Message} message Discord message object
 * @returns {Message}
 */
export async function getPota(args, message) {
  const [method, arg] = args;
  switch (method) {
    case 'spots':
      if (arg && arg === 'help') {
        return message.reply(
          `**Available commands**:
- \`${config.prefix}pota spots\` to retrieve recent Parks on the Air summit spots.
- \`${config.prefix}pota spots [callsign]\` to retrieve Parks on the Air summit spots for a callsign.
- \`${config.prefix}pota spots [band name]\` to retrieve Parks on the Air summit spots for a band name.
  - **Supported bands**: ${BAND_NAMES.join(', ')}
- [not yet implemented] \`${config.prefix}pota activations\` to retrieve Parks on the Air upcoming activations.`
        );
      }

      return getRecentSpots(message, arg);
    case 'activations':
      return message.reply(ERROR.ERROR_NOT_YET_IMPLEMENTED);
    default:
      return message.reply(`Unknown \`${config.prefix}pota\` command`);
  }
}
