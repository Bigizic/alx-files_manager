// import { createClient } from 'redis';
import { promisify } from 'util';

const redis = require('redis');

/**
 * RedisClient Module - creates a client to Redis
 */

export default class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connectionStatus = false;
    this.client.on('error', (err) => {
      throw (err);
      // eslint-disable-next-line no-unreachable
      this.connectionStatus = false;
    });
    this.client.on('connect', () => {
      this.connectionStatus = true;
    });
  }

  isAlive() {
    return this.connectionStatus;
  }

  async get(key) {
    const Gets = promisify(this.client.get).bind(this.client);
    const returnedkey = await Gets(key);
    return returnedkey;
  }

  async set(key, value, duration) {
    const Sets = promisify(this.client.set).bind(this.client);
    await Sets(key, value);
    await this.client.expire(key, duration);
  }

  async del(key) {
    const Deletion = promisify(this.client.del).bind(this.client);
    await Deletion(key);
  }
}

const client = new RedisClient();
module.exports = client;
