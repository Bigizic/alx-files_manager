import { sha1 } from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjId } from 'mongodb';

/**
 * UsersController module
 */

class UsersController {
  static async createUser(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.usersCollection.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.usersCollection.insertOne(newUser);
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

  static async getMe(request, response) {
    const header = request.headers['x-token'];
    const id = await redisClient.get(`auth_${header}`);
    console.log(id);
    const u = await dbClient.db.collection('users').findOne({ _id: new ObjId(id) });
    if (!u) { 
	    return response.status(401).send({ error: 'Unauthorized' });
    }
    return response.status(200).send(u);
  }
}

module.exports = UsersController;
