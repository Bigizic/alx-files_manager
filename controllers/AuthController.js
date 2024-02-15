#!/usr/bin/node

// eslint-disable-next-line no-undef
const sha1 = require('sha1');
// eslint-disable-next-line no-undef
const { v4 } = require('uuid');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');
// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');

class AuthController {
  /**
   * getConnect - connects an existing user to access the db
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns api token for user interactions
  */

  static async getConnect(request, response) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const authData = authHeader.split(' ')[1];
    // eslint-disable-next-line no-undef
    const decodedAuthData = Buffer.from(authData, 'base64').toString('utf-8');
    const [email, password] = decodedAuthData.split(':');
    if (!email && !password) { return response.status(401).json({ error: 'Unauthorized' }); }
    const hashedPassword = sha1(password);
    const users = await dbClient.getUserByCredentials({ email: email, password: hashedPassword });
    if (users) {
      const token = v4();
      const key = `auth_${token}`;
      await redisClient.set(key, users._id.toString(), 60 * 60 * 24);
      response.status(200).json({ token });
    } else {
      response.status(401).json({ error: 'Unauthorized' });
    }
  }

  /**
   * getDisconnect - disconnects a user
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns None
  */

  static async getDisconnect(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      response.status(204).json({});
    } else {
      response.status(401).json({ error: 'Unauthorized' });
    }
  }
}
// eslint-disable-next-line no-undef
module.exports = AuthController;
