#!/usr/bin/node

// eslint-disable-next-line no-undef
const { createClient } = require('redis');
// eslint-disable-next-line no-undef
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = createClient(6379, '0.0.0.0');

    this.client.on('error', () => { console.log('error connection to redis'); });
    this.connectStatus = false;

    this.client.on('connect', () => { this.connectStatus = true; });
  }

  /**
   * isAlive - checks if redis client is alive
   * @returns {boolean}
   */
  isAlive() {
    return this.connectStatus;
  }

  /**
   * Retrives the value of a key
   * @param {string} key
   * @returns {Strin | object}
   */
  async get(key) {
    const Gets = promisify(this.client.get).bind(this.client);
    const returnedkey = await Gets(key);
    return returnedkey;
  }

  /**
   * set - sets a value to a key along with an expire time
   * @param {string} key
   * @param {string} value
   * @param {Integer} duration
   */
  async set(key, value, duration) {
    const Sets = promisify(this.client.set).bind(this.client);
    await Sets(key, value, 'EX', duration);
  }

  /**
   * del - deletes a given key
   * @param {string} key
   */
  async del(key) {
    const Deletion = promisify(this.client.del).bind(this.client);
    await Deletion(key);
  }
}

const redisClient = new RedisClient();
// eslint-disable-next-line no-undef
module.exports = redisClient;
