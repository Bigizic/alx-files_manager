#!/usr/bin/node

// eslint-disable-next-line no-undef
const sha1 = require('sha1');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');
// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');

// UsersController - Controller Module for the User utilities
class UsersController {
  /**
   * postNew - Creates a new User in MongoDb 'users' Collection
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns Created User if they don't exist else Error
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
  /**
   * getMe - Retrieves a user based on authentication token('x-token')
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns User if found else error: 'Unauthorized'
   */

  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const user = await dbClient.getUserById(userId);
      if (user) {
        response.status(200).json({ id: userId, email: user.email });
      } else { response.status(401).json({ error: 'Unauthorized' }); }
    } else { response.status(401).json({ error: 'Unauthorized' }); }
  }
}
// eslint-disable-next-line no-undef
module.exports = UsersController;
