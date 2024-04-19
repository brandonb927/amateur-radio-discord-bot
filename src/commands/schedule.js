import { Client, ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CronTime } from 'cron';
import cronstrue from 'cronstrue';
import { markdownTable } from 'markdown-table';
import { db, getNextTableId } from '../utils/db.js';
import { hasRole, Role } from '../utils/roles.js';
import { loadScheduledMessages } from '../utils/scheduledMessages.js';

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
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Channel to send message to')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
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
        .setName('remove')
        .setDescription('Deletes an existing scheduled message by its id')
        .addStringOption((option) =>
          option.setName('id').setDescription('Scheduled message id').setRequired(true)
        )
    ),
  /**
   * Execution of `schedule` slash-command
   *
   * @param {ChatInputCommandInteraction} interaction Chat interaction object
   * @returns {ChatInputCommandInteraction}
   */
  async execute(interaction) {
    switch (interaction.options.getSubcommand()) {
      case 'list':
        if (!hasRole(interaction.member, Role.BOT_ADMIN)) break;
        return await handleScheduleList(interaction);
      case 'new':
        if (!hasRole(interaction.member, Role.BOT_ADMIN)) break;
        return await handleScheduleNew(interaction);
      case 'remove':
        if (!hasRole(interaction.member, Role.BOT_ADMIN)) break;
        return await handleScheduleRemove(interaction);
      default:
        break;
    }

    return await interaction.reply({
      content: `You must have '${Role.BOT_ADMIN}' role to use this command`,
    });
  },
};

/**
 * Formats a given cron syntax string to a human readable string.
 *
 * @param {string} string Cron syntax schedule
 * @returns {string}
 */
function formatCron(string) {
  return cronstrue.toString(string, { use24HourTimeFormat: true });
}

/**
 * Returns a markdown-formatted list of the scheduled messages from the db
 *
 * @param {Client} client The active Discord server client instance
 * @returns {string}
 */
function listScheduledMessages(client) {
  let table = [['Id', 'Channel', 'Schedule', 'Notification content']];

  db.data.scheduledMessages.map(({ id, channel, schedule, message }) => {
    const discordChannel = client.channels.cache.get(channel);
    table.push([id, `#${discordChannel.name}`, `[${schedule}] ${formatCron(schedule)}`, message]);
  });

  return `\`\`\`${markdownTable(table)}\`\`\``;
}

/**
 * Handle the `/schedule list` subcommand
 *
 * @param {ChatInputCommandInteraction} interaction Chat interaction object
 * @returns {ChatInputCommandInteraction}
 */
async function handleScheduleList(interaction) {
  return await interaction.reply({
    content: listScheduledMessages(interaction.client),
  });
}

/**
 * Handle the `/schedule new` subcommand
 *
 * @param {ChatInputCommandInteraction} interaction Chat interaction object
 * @returns {ChatInputCommandInteraction}
 */
async function handleScheduleNew(interaction) {
  const channel = interaction.options.getChannel('channel');
  const schedule = interaction.options.getString('cron');
  const message = interaction.options.getString('message');

  try {
    new CronTime(schedule);
  } catch (error) {
    console.error(error);
    return await interaction.reply({
      content: cronScheduleInvalid,
    });
  }

  const id = getNextTableId(db.data.scheduledMessages);
  await db.update(({ scheduledMessages }) => {
    const scheduled = {
      id,
      channel: channel.id,
      schedule,
      message,
    };
    scheduledMessages.push(scheduled);
  });

  loadScheduledMessages(interaction.client);

  return await interaction.reply({
    content: `Your message has been scheduled with id ${id}\n${listScheduledMessages(interaction.client)}`,
  });
}

/**
 * Handle the `/schedule remove` subcommand
 *
 * @param {ChatInputCommandInteraction} interaction Chat interaction object
 * @returns {ChatInputCommandInteraction}
 */
async function handleScheduleRemove(interaction) {
  const id = interaction.options.getString('id');

  db.update(({ scheduledMessages }) => {
    db.data.scheduledMessages = scheduledMessages.filter(
      (notification) => notification.id !== parseInt(id)
    );
  });

  loadScheduledMessages(interaction.client);

  return await interaction.reply({
    content: `Your message has been deleted with id ${id}\n${listScheduledMessages(interaction.client)}`,
  });
}
