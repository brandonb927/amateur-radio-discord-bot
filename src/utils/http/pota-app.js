import got from 'got';
import config from '../config.js';

export default got.extend({
  prefixUrl: 'https://api.pota.app/',
  headers: {
    'user-agent': config.user_agent,
  },
});
