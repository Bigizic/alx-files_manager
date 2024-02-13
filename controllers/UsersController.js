#!/usr/bin/node

const sha1 = require('sha1');
const dbClient = require('../utils/db');

/**
 * UsersController module
*/

export default class UsersController {
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
}
