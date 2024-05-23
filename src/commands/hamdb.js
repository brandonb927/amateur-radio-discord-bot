import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import client from '../utils/http/hamdb-org.js';
import config from '../utils/config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('hamdb')
    .setDescription('Query HamDB')
    .addStringOption((option) =>
      option.setName('callsign').setDescription('Lookup a callsign on HamDB').setRequired(true)
    ),
  /**
   * Execution of `hamdb` slash-command
   *
   * @param {ChatInputCommandInteraction} interaction Chat interaction object
   * @returns {ChatInputCommandInteraction}
   */
  async execute(interaction) {
    const callsign = interaction.options.getString('callsign');
    try {
      const { hamdb } = await client.get(`${callsign}/json/${config.app_name}`).json();
      if (hamdb.messages.status === 'NOT_FOUND') {
        return interaction.reply(
          `There is no information associated with \`${callsign}\`, try another callsign.`
        );
      } else {
        const {
          // status, lat, lon,
          call,
          grid,
          fname,
          name,
          state,
          country,
        } = hamdb.callsign;
        return await interaction.reply({
          content: `**Information from HamDB:**\n\`\`\`
${call}
${fname} ${name}
${state}, ${country}
${grid ? `View grid square: https://www.karhukoti.com/maidenhead-grid-square-locator/?grid=${grid}` : 'Grid square not available'}
\`\`\``,
        });
      }
    } catch (error) {
      console.error(error);
      return interaction.reply('There was an error retrieving information from HamDB');
    }
  },
};
