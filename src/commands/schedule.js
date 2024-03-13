import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import cronParser from 'cron-parser';
import cronstrue from 'cronstrue';
import { markdownTable } from 'markdown-table';
import { db, getNextTableId } from '../utils/db.js';

const descriptionCronSyntax =
  'Cron syntax schedule, consult https://crontab.guru for assistance here';

const cronScheduleInvalid = 'Your cron schedule syntax is not valid, try something else.';

export default {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Set a message to be posted on a schedule')
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('Lists all scheduled messages')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('new')
        .setDescription('Creates a new scheduled message')
        .addStringOption((option) =>
          option.setName('cron').setDescription(descriptionCronSyntax).setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('Message to be posted on schedule')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('update')
        .setDescription('Updates an existing scheduled message by its id')
        .addStringOption((option) =>
          option.setName('id').setDescription('Scheduled message id').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('cron').setDescription(descriptionCronSyntax).setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('Message to be posted on schedule')
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('delete')
        .setDescription('Deletes an existing scheduled message by its id')
        .addStringOption((option) =>
          option.setName('id').setDescription('Scheduled message id').setRequired(true)
        )
    )
    .setDefaultMemberPermissions(0),
  /**
   * Execution of `schedule` slash-command
   *
   * @param {ChatInputCommandInteraction} interaction Chat interaction object
   * @returns {ChatInputCommandInteraction}
   */
  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'list':
        return await handleScheduleList(interaction);
      case 'new':
        return await handleScheduleNew(interaction);
      case 'update':
        return await handleScheduleUpdate(interaction);
      default:
        break;
    }

    return await interaction.reply({
      content: 'You must have `Bot Admin` role to use this command',
    });
  },
};

/**
 * Foramts a given cron syntax string to a human readable string.
 *
 * @param {string} string Cron syntax schedule
 * @returns {string}
 */
function formatCron(string) {
  return cronstrue.toString(string, { use24HourTimeFormat: true });
}

/**
 * Handle the `/schedule list` subcommand
 *
 * @param {ChatInputCommandInteraction} interaction Chat interaction object
 * @returns {ChatInputCommandInteraction}
 */
async function handleScheduleList(interaction) {
  let table = [['Id', 'Schedule', 'Notification content']];

  db.data.scheduledMessages.map(({ id, schedule, message }) => {
    table.push([id, schedule, JSON.parse(message)]);
  });

  return await interaction.reply({
    content: `\`\`\`${markdownTable(table)}\`\`\``,
  });
}

/**
 * Handle the `/schedule new` subcommand
 *
 * @param {ChatInputCommandInteraction} interaction Chat interaction object
 * @returns {ChatInputCommandInteraction}
 */
async function handleScheduleNew(interaction) {
  const cronSchedule = interaction.options.getString('cron');
  const message = interaction.options.getString('message');

  try {
    cronParser.parseExpression(cronSchedule);
  } catch (error) {
    console.error(error);
    return await interaction.reply({
      content: cronScheduleInvalid,
    });
  }

  const id = getNextTableId(db.data.scheduledMessages);
  await db.update(({ scheduledMessages }) => {
    scheduledMessages.push({
      id,
      schedule: cronSchedule,
      message: JSON.stringify(message),
    });
  });

  return await interaction.reply({
    content: `Your scheduled message
\`\`\`
ID: ${id}
Schedule: [${cronSchedule}] ${formatCron(cronSchedule)}
Message: ${message}
\`\`\``,
  });
}

/**
 * Handle the `/schedule update` subcommand
 *
 * @param {ChatInputCommandInteraction} interaction Chat interaction object
 * @returns {ChatInputCommandInteraction}
 */
async function handleScheduleUpdate(interaction) {
  const id = interaction.options.getString('id');
  const cronSchedule = interaction.options.getString('cron');
  const message = interaction.options.getString('message');

  try {
    cronParser.parseExpression(cronSchedule);
  } catch (error) {
    console.error(error);
    return await interaction.reply({
      content: cronScheduleInvalid,
    });
  }

  await db.update(({ scheduledMessages }) => {
    const notification = scheduledMessages.find((notification) => notification.id === parseInt(id));
    notification.schedule = cronSchedule;
    notification.message = JSON.stringify(message);
  });

  return await interaction.reply({
    content: `Your scheduled message
\`\`\`
ID: ${id}
Schedule: [${cronSchedule}] ${formatCron(cronSchedule)}
Message: ${message}
\`\`\``,
  });
}
