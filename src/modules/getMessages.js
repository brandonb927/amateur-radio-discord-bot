import { EmbedBuilder } from 'discord.js';
import { DATE_OPTIONS } from '../utils/enums.js';
import config from '../utils/loadConfig.js';
import client from '../utils/http/aprs-fi.js';
import { getAprsFiCallsignTrackingUrl } from '../utils/getAprsFiCallsignTrackingUrl.js';

export async function getMessages(args, message) {
  const [callsign] = args;

  if (!callsign) {
    return message.channel.send("Hmm, Looks like you didn't provide a callsign. Try again!");
  }

  try {
    const data = await client
      .get(`get?what=msg&dst=${callsign}&apikey=${config.aprs_token}&format=json`)
      .json();

    if (!data.found) {
      return message.reply(
        `There are no recent APRS messages to ${callsign}, try another callsign.`
      );
    } else {
      let content = '';

      data.entries.forEach((aprsMessage) => {
        const srcCall = aprsMessage.srccall;
        const msg = aprsMessage.message;
        const time = new Date(aprsMessage.time * 1000);

        content += `
**Source Call:** [${srcCall}](${getAprsFiCallsignTrackingUrl(srcCall)})
**Message:** ${msg}
**Time:** ${time.toLocaleString('en-US', DATE_OPTIONS)}
`;
      });

      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(config.embed_color)
            .setTitle(`10 Latest Messages To ${callsign}`)
            .setDescription(content)
            .setTimestamp()
            .setFooter({ text: 'Source: https://aprs.fi' }),
        ],
      });
    }
  } catch (error) {
    return console.error(error);
  }
}
