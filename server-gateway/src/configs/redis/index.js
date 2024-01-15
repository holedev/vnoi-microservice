import { createClient } from 'redis';
import { MY_ENV } from '../env/index.js';
import { sendErrorLog } from '../../utils/log.js';

const redis = await createClient({
  url: `redis://${MY_ENV.REDIS_HOST}:${MY_ENV.REDIS_PORT}`,
})
  .on('connect', () => console.log(`---> GATEWAY | Connected to Redis <---`))
  .on('error', (err) => {
    MY_ENV.NODE_ENV === 'dev'
      ? console.log('Redis Client Error\n', err)
      : sendErrorLog(err);
  })
  .connect();

export { redis };
