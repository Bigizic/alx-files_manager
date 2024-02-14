#!/usr/bin/node

// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');

// AppController - Controller Module for Application Status plus extra checks
class AppController {
  /**
   * getStatus - Get all DB, Connection Status
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns {redis: status, MongoDB: status}
   */
  static getStatus(req, res) {
    const redisIsAlive = redisClient.isAlive();
    const dbIsAlive = dbClient.isAlive();
    res.status(200).json({ redis: redisIsAlive, db: dbIsAlive });
  }

  /**
   * getStats - Get number of documents in a Mongo database
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns {users: db.collection.users.countDocuments, files: db.collection.files.countDocuments}
   */

  static async getStats(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    res.status(200).json({ users: nbUsers, files: nbFiles });
  }
}

// eslint-disable-next-line no-undef
module.exports = AppController;
