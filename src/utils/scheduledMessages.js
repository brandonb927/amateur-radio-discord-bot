import { Client } from 'discord.js';
import { CronJob } from 'cron';
import { db } from './db.js';
import config from './config.js';
const { Channel } = import('discord.js');

/**
 * Loads scheduled messages from the database and adds them as cronjobs
 *
 * @param {Client} client The active Discord server client instance
 * @returns {CronJob[]}
 */
export function loadScheduledMessages(client) {
  if (client.cronJobs) {
    client.cronJobs.map((cronjob) => {
      cronjob.stop();
    });
  }

  const { scheduledMessages } = db.data;
  let cronJobs = [];
  console.log(`Loading ${scheduledMessages.length} cronjobs`);

  try {
    scheduledMessages.map((scheduled) => {
      const channel = client.channels.cache.get(scheduled.channel);
      cronJobs.push(scheduleMessage(channel, scheduled));
    });
  } catch (error) {
    console.error('Error trying to send: ', error);
  }

  return cronJobs;
}

/**
 * Schedule a message to a cronjob
 *
 * @param {Channel} channel The channel on the Discord server to send the message to
 * @param {*} scheduled Scheduled message entry from db
 * @returns {CronJob}
 */
export function scheduleMessage(channel, scheduled) {
  const { schedule, message } = scheduled;
  const cronjob = new CronJob(
    schedule,
    function () {
      console.log(`\nSending message to channel #${channel.name}`);
      console.log(`  ${message}`);
      channel.send(message);
    },
    false,
    config.timezone
  );
  cronjob.start();
  return cronjob;
}
