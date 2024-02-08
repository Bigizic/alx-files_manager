import { createClient } from 'redis';
import { promisify } from 'util';
/**
 * RedisClient Module
 */

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.log(`The client not connected to server: ${err}`);
    });
  }
  
  isAlive() {
    if (this.client.connected) {
	    return true;
    }
    return false;
  }
    
  async get(k) {
    const Gets = promisify(this.client.get).bind(this.client);
    const returnedkey = await Gets(k);
    return returnedkey;
  }

  async set(k, v, duration) {
    const Sets = promisify(this.client.set).bind(this.client);
    await Sets(k, v);
    await this.client.expire(k, duration);
  }

  async del(k) {
    const Deletion = promisify(this.client.del).bind(this.client);
    await Deletion(k);
  }
}

const Client = new RedisClient();
