import { EmbedBuilder } from 'discord.js';
import client from '../utils/http/pota-app.js';
import { bandNames, mapFrequencyToBandName } from '../utils/enums.js';
import config from '../utils/loadConfig.js';

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
        },
        {
          name: 'Frequency',
          value: `${spot.frequency} MHz (${mapFrequencyToBandName(spot.frequency)}${spot.mode && `, ${spot.mode}`})`,
        },
        spot.grid6 && {
          name: 'Grid Square',
          value: spot.grid6,
        },
        spot.comments && {
          name: 'Comments',
          value: spot.comments,
        },
      ].filter(Boolean)
    )
    .setFooter({
      text: `Spotter: ${spot.spotter} | Last Heard: ${new Date(spot.spotTime).toUTCString()}`,
    });

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
      .slice(0, 10)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    // If there are no spots after filtering by the band, send a message back
    if (!filteredData.length) {
      return message.reply(`There are no POTA spots for the \`${band}\` band`);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      embeds,
    });
  } catch (error) {
    message.reply('There was an error retrieving POTA spots');
    return console.error(error);
  }
}

async function getRecentSpotsByCallsign(message, callsign) {
  try {
    let data = await client.get(`spot/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current POTA spots
    if (!data.length) {
      return message.reply('There are no recent POTA spots');
    }

    const filteredData = data
      .filter((spot) => spot.spotter === callsign || spot.activator === callsign)
      .slice(0, 10)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    // If there are no spots after filtering by the callsign, send a message back
    if (!filteredData.length) {
      return message.reply(`There are no POTA spots for \`${callsign}\``);
    }

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      embeds,
    });
  } catch (error) {
    message.reply('There was an error retrieving POTA spots');
    return console.error(error);
  }
}

async function getRecentSpots(message) {
  try {
    let data = await client.get(`spot/`).json();
    let embeds = [];

    // If the API returns nothing, there are no current POTA spots
    if (!data.length) {
      return message.reply('There are no recent POTA spots');
    }

    const filteredData = data
      .slice(0, 10)
      .sort((a, b) => new Date(a.spotTime).getTime() - new Date(b.spotTime).getTime());

    for (const spot of filteredData) {
      embeds.push(getEmbed(spot));
    }

    return message.reply({
      embeds,
    });
  } catch (error) {
    message.reply('There was an error retrieving POTA spots');
    return console.error(error);
  }
}

export async function getPota(args, message) {
  const [method, arg] = args;
  switch (method) {
    case 'spots':
      if (arg) {
        if (bandNames.includes(arg)) {
          getRecentSpotsByBand(message, arg);
        } else {
          getRecentSpotsByCallsign(message, arg);
        }
      } else {
        getRecentSpots(message);
      }
      break;
    case 'activations':
      //
      break;
    default:
      return message.reply(`Unknown \`${config.prefix}pota\` command`);
  }
}
