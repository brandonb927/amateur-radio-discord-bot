import { Client } from 'discord.js';
import cron from 'node-cron';
import { db } from './utils/db.js';

/**
 * Loads scheduled messages from the database and adds them as cronjobs
 *
 * @param {Client} client The active Discord server client instance
 */
export function loadScheduledMessages(client) {
  const { scheduledMessages } = db.data;
  console.log(`Loading ${scheduledMessages.length} cronjobs`);

  try {
    scheduledMessages.map((scheduled) => {
      const { schedule, message } = scheduled;
      const channel = client.channels.cache.get(scheduled.channel);
      cron.schedule(schedule, () => {
        console.log(`Sending message to channel #${channel.name}`);
        channel.send(message);
      });
    });
  } catch (error) {
    console.error('Error trying to send: ', error);
  }
}
