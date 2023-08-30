import dateParser from 'any-date-parser';
import { ISSocket } from 'js-aprs-is';
import { aprsParser } from 'js-aprs-fap';
import config from '../utils/loadConfig.js';

// TODO: check that timeRange matches against available values in README.md
const timeRangeValues = ['1h', '3h', '6h', '12h', '24h', '48h', '72h', '7d'];

/**
 * Gets telemetry information for a given callsign and time range
 *
 * @param {string} callsign
 * @param {string} timeRange
 * @param {import('discord.js').Message} message
 */
export async function getTelemetry(callsign, timeRange, message) {
  if (!callsign) {
    return message.reply("Hmm, looks like you didn't provide a callsign. Try again!");
  }

  if (!timeRange || !timeRangeValues.includes(timeRange)) {
    return message.reply("Hmm, looks like you didn't provide a valid time range. Try again!");
  }

  const parsedTimeRange = dateParser.fromString(timeRange);
  console.log(parsedTimeRange);

  try {
    // https://www.aprs-is.net/javAPRSFilter.aspx
    let connection = new ISSocket(
      config.aprs_is_server,
      config.aprs_is_server_port,
      config.aprs_is_callsign,
      config.aprs_is_passcode,
      't/t'
    );
    let parser = new aprsParser();
    let originalMsg;
    let timeout = false;

    connection.connect();

    connection.on('connect', () => {
      connection.sendLine(connection.userLogin);

      setTimeout(()=> {
        timeout = true
      }, 30000)
    });

    connection.on('packet', (data) => {
      // If we haven't hit the 30s timeout, continue
      if (connection.isConnected() && !timeout) {
        // Filter out login line and server messages to get real packets
        if (data.charAt(0) !== '#' && !data.startsWith('user')) {
          const parsedData = parser.parseaprs(data);
          // console.log(parsedData);
          if (parsedData.sourceCallsign === callsign) {
            console.log(parsedData);
            originalMsg.reply(parsedData);
          }
        } else {
          console.log(data);
        }
      } else {
        connection.disconnect();
      }
    });

    connection.on('close', () => {
      console.warn('Bailing out after 30s!')
    });

    connection.on('error', console.error);

    originalMsg = await message.channel.send(`Querying the APRS-IS network for ${callsign}...`);
  } catch (error) {
    return console.error(error);
  }
}
