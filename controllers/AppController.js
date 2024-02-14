#!/usr/bin/node

// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');

class AppController {
  /**
   * AppController - 
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns HTTP Response.status(Integer).json(Response Body)
   */
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

// eslint-disable-next-line no-undef
module.exports = AppController;
