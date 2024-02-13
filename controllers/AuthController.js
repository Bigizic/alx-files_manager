#!/usr/bin/node

/**
 * Authentication of the user.
*/

const sha1 = require('sha1');
const { v4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { getParams, splitAuthHeader } = require('../utils/auth');

export default class AuthController {
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
}
