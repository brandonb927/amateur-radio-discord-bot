import { Events } from 'discord.js';
import * as Sentry from '@sentry/node';
import config from '../utils/config.js';

export default {
  name: Events.Error,
  async execute(e) {
    if (config.sentry_dsn) {
      Sentry.captureException(e);
    } else {
      console.error(e);
    }
  },
};
