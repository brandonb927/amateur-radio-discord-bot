import 'dotenv/config';

/**
 * Utility function to retrieve a given environment variable by key and crash the process in the event it is missing.
 *
 * @param {string} name Environmant variable key name
 * @param {string|null} fallback Fallback value to use if not found
 * @returns {string}
 */
function getEnv(name, fallback = null) {
  let val = process.env[name];
  if (val === undefined || val === null) {
    if (fallback === null) {
      throw `Missing environment variale for ${name}`;
    }
    return fallback;
  }
  return val;
}

// Allow environment variables to be defined as well for config values
export default {
  token: getEnv('BOT_DISCORD_TOKEN'),
  app_id: getEnv('BOT_DISCORD_APP_ID'),
  guild_id: getEnv('BOT_DISCORD_GUILD_ID'),
  prefix: getEnv('BOT_MSG_PREFIX', '?'),
  aprs_token: getEnv('BOT_APRSFI_TOKEN'),
  gmaps_token: getEnv('BOT_GMAPS_TOKEN'),
  timezone: getEnv('BOT_TIMEZONE', 'America/Vancouver'),
  embed_color: getEnv('BOT_EMBED_COLOR', '#efefef'),
  user_agent: getEnv(
    'BOT_USER_AGENT',
    'amateur-radio-discord-bot v1 (+https://github.com/brandonb927/amateur-radio-discord-bot)'
  ),
  sentry_dsn: getEnv('BOT_SENTRY_DSN', false),
  sentry_env: getEnv('BOT_SENTRY_ENVIRONMENT', 'local'),
};
