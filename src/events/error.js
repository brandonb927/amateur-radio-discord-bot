import { Events } from 'discord.js';

export default {
  name: Events.Error,
  async execute(e) {
    // TODO: connect Sentry.io here
    console.error(e);
  },
};
