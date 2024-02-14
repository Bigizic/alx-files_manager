#!/usr/bin/node

// eslint-disable-next-line no-undef
const sha1 = require('sha1');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');
// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');

class UsersController {
  /**
   * Controller Module for the User utilities
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns HTTP Response.status(Integer).json(Response Body)
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.userExists(email);
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.createUser(newUser);
      const insertedUser = {
        id: result.insertedId,
        email: newUser.email,
      };
      return res.status(201).json(insertedUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

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
module.exports = UsersController;
