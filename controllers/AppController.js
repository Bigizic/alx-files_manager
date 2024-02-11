import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * The file that contains the two endpoints
 * in the index.js file
 */

export default class AppController {
  static getStatus(req, res) {
    const redisIsAlive = redisClient.isAlive();
    const dbIsAlive = dbClient.isAlive();
    res.status(200).json({ redis: redisIsAlive, db: dbIsAlive });
  }

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    res.status(200).json({ users: nbUsers, files: nbFiles });
  }
}

module.exports = AppController;
