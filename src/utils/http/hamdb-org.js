import got from 'got';
import config from '../config.js';

export default got.extend({
  prefixUrl: 'http://api.hamdb.org/',
  headers: {
    'user-agent': config.user_agent,
  },
});
