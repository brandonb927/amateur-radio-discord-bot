import { EmbedBuilder } from 'discord.js';
import { DATE_OPTIONS } from '../utils/enums.js';
import client from '../utils/http/sota-org.js';
import config from '../utils/loadConfig.js';

// const sourceText = 'Source: https://www.sota.org.uk/';

const getEmbed = (spot) =>
  new EmbedBuilder()
    .setColor(config.embed_color)
    .setTitle(`${spot.activatorCallsign} @ ${spot.summitCode}`)
    .addFields(
      {
        name: 'Frequency',
        value: `${spot.frequency} MHz (${spot.mode})`,
      },
      {
        name: 'Comments',
        value: spot.comments,
      }
    )
    .setTimestamp(new Date(spot.timeStamp).toLocaleString('en-US', DATE_OPTIONS));

async function getRecentSpotsByCallsign(callsign, message) {
  try {
    let data = await client.get(`spots/200/`).json();
    let embeds;

    // If the API returns nothing, there are no current SOTA activations
    if (!data.length) {
      return message.reply('There are no recent SOTA activations by that callsign');
    }

    const filteredData = data.filter((spot) => spot.activatorCallsign === callsign);

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      embeds,
    });
  } catch (error) {
    return console.error(error);
  }
}

async function getRecentSpots(message) {
  try {
    let data = await client.get(`spots/10/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current SOTA activations
    if (!data.length) {
      return message.reply('There are no recent SOTA activations');
    }

    for (const spot of data) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      embeds,
    });
  } catch (error) {
    return console.error(error);
  }
}

export async function getSota(args, message) {
  const [method, callsign] = args;
  switch (method) {
    case 'activations':
      if (callsign) {
        getRecentSpotsByCallsign(message, callsign);
      } else {
        getRecentSpots(message);
      }
      break;
    case 'spots':
      //
      break;
    default:
      return message.reply(`Unknown \`${config.prefix}sota\` command`);
  }
}
