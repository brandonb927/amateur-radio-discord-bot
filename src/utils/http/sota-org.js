import got from 'got';
import config from '../config.js';

export default got.extend({
  prefixUrl: 'https://api2.sota.org.uk/api/',
  headers: {
    'user-agent': config.user_agent,
  },
});
