import 'dotenv/config';

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
  prefix: getEnv('BOT_MSG_PREFIX', '?'),
  aprs_token: getEnv('BOT_APRSFI_TOKEN'),
  gmaps_token: getEnv('BOT_GMAPS_TOKEN'),
  timezone: getEnv('BOT_TIMEZONE', 'America/Vancouver'),
  embed_color: getEnv('BOT_EMBED_COLOR', '#efefef'),
  user_agent: getEnv(
    'BOT_USER_AGENT',
    'amateur-radio-discord-bot v1 (+https://github.com/brandonb927/amateur-radio-discord-bot)'
  ),
};
