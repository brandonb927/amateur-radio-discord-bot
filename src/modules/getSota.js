import { EmbedBuilder, Message } from 'discord.js';
import { bandNames, mapFrequencyToBandName } from '../utils/enums.js';
import client from '../utils/http/sota-org.js';
import config from '../utils/loadConfig.js';

const NUM_SPOTS = 10;

const getEmbed = (spot) =>
  new EmbedBuilder()
    .setColor(config.embed_color)
    .setURL(`http://summits.sota.org.uk/en/summit/${spot.associationCode}/${spot.summitCode}`)
    .setTitle(`${spot.activatorCallsign} @ ${spot.summitCode}`)
    .addFields(
      [
        {
          name: 'Frequency',
          value: `${spot.frequency} MHz (${mapFrequencyToBandName(spot.frequency)}${spot.mode && `, ${spot.mode}`})`,
          inline: true,
        },
        {
          name: 'Summit details',
          value: spot.summitDetails,
          inline: true,
        },
        spot.comments && {
          name: 'Comments',
          value: spot.comments,
        },
      ].filter(Boolean)
    )
    .setFooter({
      text: `Spotted by ${spot.callsign.trim()} at ${new Date(spot.timeStamp).toUTCString()}`,
    });

/**
 * Get recent SOTA spots by a given band
 *
 * @param {Message} message Discord message object
 * @param {string} band Selected band to filter results by
 * @returns {Message}
 */
async function getRecentSpotsByBand(message, band) {
  try {
    let data = await client.get(`spots/200/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current SOTA spots
    if (!data.length) {
      return message.reply(`There are no SOTA spots for the \`${band}\` band`);
    }

    const filteredData = data
      .filter((spot) => mapFrequencyToBandName(spot.frequency) === band)
      .slice(0, NUM_SPOTS)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    // If there are no spots after filtering by the band, send a message back
    if (!filteredData.length) {
      return message.reply(`There was an error retrieving SOTA spots for the \`${band}\` band`);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      content: `Here are the most recent SOTA spots for the \`${band}\` band`,
      embeds,
    });
  } catch (error) {
    console.error(error);
    return message.reply('There was an error retrieving SOTA spots');
  }
}

/**
 * Get recent SOTA spots for a given callsign
 *
 * @param {Message} message Discord message object
 * @param {string} callsign Selected callsign to filter results by
 * @returns {Message}
 */
async function getRecentSpotsByCallsign(message, callsign) {
  try {
    let data = await client.get(`spots/200/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current SOTA spots
    if (!data.length) {
      return message.reply(`There are no recent SOTA spots for callsign ${callsign}`);
    }

    const filteredData = data.filter((spot) => spot.activatorCallsign.trim() === callsign);

    // If for any reason the filtered data is empty, return _something_
    if (!filteredData.length) {
      return message.reply(`There was an error retrieving SOTA spots for callsign ${callsign}`);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      content: `Here are the most recent SOTA spots for the \`${callsign}\``,
      embeds,
    });
  } catch (error) {
    console.error(error);
    return message.reply('There was an error retrieving SOTA spots');
  }
}

/**
 * Get `NUM_SPOTS` recent SOTA Spots
 *
 * @param {Message} message Discord message object
 * @returns {Message}
 */
async function getRecentSpots(message) {
  try {
    let data = await client.get(`spots/${NUM_SPOTS}/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current SOTA spots
    if (!data.length) {
      return message.reply('There are no recent SOTA spots');
    }

    for (const spot of data) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      content: 'Here are the most recent SOTA spots:',
      embeds,
    });
  } catch (error) {
    console.error(error);
    return message.reply('There was an error retrieving SOTA spots');
  }
}

/**
 * Process SOTA command with args
 *
 * @param {string[]} args Arguments passed to the given command
 * @param {Message} message Discord message object
 * @returns {Message}
 */
export async function getSota(args, message) {
  const [method, arg] = args;
  switch (method) {
    case 'spots':
      if (arg) {
        if (arg === 'help') {
          return message.reply(
            `**Available commands**:
- \`${config.prefix}sota spots\` to retrieve recent Summits on the Air summit spots.
- \`${config.prefix}sota spots [callsign]\` to retrieve Summits on the Air summit spots for a callsign.
- \`${config.prefix}sota spots [band name]\` to retrieve Summits on the Air summit spots for a band name.
  - Supported bands: ${bandNames.join(', ')}
- [not yet implemented] \`${config.prefix}sota activations\` to retrieve Summits on the Air upcoming activations.`
          );
        }

        if (bandNames.includes(arg)) {
          return getRecentSpotsByBand(message, arg);
        }
        return getRecentSpotsByCallsign(message, arg);
      }
      return getRecentSpots(message);
    case 'activations':
      return message.reply('Not yet implemented!');
    default:
      return message.reply(`Unknown \`${config.prefix}sota\` command`);
  }
}
