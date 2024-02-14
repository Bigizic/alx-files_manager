#!/usr/bin/node

// eslint-disable-next-line no-undef
const sha1 = require('sha1');
// eslint-disable-next-line no-undef
const { v4 } = require('uuid');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');
// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');
// eslint-disable-next-line no-undef
const { getParams, splitAuthHeader } = require('../utils/auth');

class AuthController {
  /**
   * getConnect - connects an existing user to access the db
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns api token for user interactions
  */

  static async getConnect(request, response) {
    const token = splitAuthHeader(request.headers.authorization);
    const string = atob(token);

    const [email, pass] = getParams(string);
    const fetchUser = await dbClient.userExists(email);

    if (!fetchUser || sha1(pass) !== fetchUser.password) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    const randstr = v4();
    await redisClient.set(`auth_${randstr}`, fetchUser._id.toString('utf8'), 86400);
    return response.json({ token: randstr });
  }

  /**
   * getDisconnect - disconnects a user
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns None
  */

  static async getDisconnect(request, response) {
    const header = request.headers['x-token'];
    const id = await redisClient.get(`auth_${header}`);
    const u = await dbClient.getUserById(id);
    if (!u) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${header}`);
    return response.status(204).json();
  }

  /**
   * getMe - Retrieves a user based on authentication token('x-token')
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns User if found else error: 'Unauthorized'
  */

  static async getMe(req, res) {
    const header = req.headers['x-token'];
    const id = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(id);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}
// eslint-disable-next-line no-undef
module.exports = AuthController;
