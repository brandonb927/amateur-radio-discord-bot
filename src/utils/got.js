import got from 'got';

export default got.extend({
  headers: {
    'user-agent': `aprs-discord-bot v1 (+https://github.com/brandonb927/aprs-discord-bot)`,
  },
});
