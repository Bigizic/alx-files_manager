#!/usr/bin/node

const { MongoClient } = require('mongodb');

const mongo = require('mongodb');

/**
 * DBClient module - creates a client to Mongodb
*/

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const db = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${db}`;
    this.mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
    this.mongoClient.connect().then(() => {
      this.db = this.mongoClient.db(`${db}`);
    }).catch((e) => {
      console.log(e);
    });
    // this.connect();
  }

  /* async connect() {
    try {
      await this.mongoClient.connect();
      this.db = this.mongoClient.db();

      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const fileData = {
        filename: 'example.txt',
        size: 1024,
        type: 'text/plain',
        owner: 'John Doe',
      };

      await this.insertData(userData, fileData);
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  } */

  isAlive() {
    return this.mongoClient.topology.isConnected();
  }

  /* async insertData(userData, fileData) {
    try {
      const usersCollection = this.db.collection('users');
      const filesCollection = this.db.collection('files');

      await usersCollection.insertOne(userData);
      await filesCollection.insertOne(fileData);
    } catch (error) {
      console.error('Error inserting data into MongoDB:', error);
    }
  } */

  async nbUsers() {
    const db = this.mongoClient.db();
    const users = db.collection('users');
    return users.countDocuments();
  }

  async nbFiles() {
    const db = this.mongoClient.db();
    const files = db.collection('files');

    return files.countDocuments();
  }

  async userExists(email) {
    const db = this.mongoClient.db();
    const exists = await db.collection('users').findOne({ email });

    return exists;
  }

  async createUser(newUser) {
    const db = this.mongoClient.db();
    const creator = await db.collection('users').insertOne(newUser);

    return creator;
  }

  async getUserById(id) {
    const db = this.mongoClient.db();
    const _id = new mongo.ObjectId(id);
    const exists = await db.collection('users').findOne({ _id });
    return exists;
  }

  async getFileById(id) {
    const db = this.mongoClient.db();
    const _id = new mongo.ObjectId(id);
    const exists = await db.collection('files').findOne({ _id });

    return exists;
  }

  async createFile(fileName) {
    const db = this.mongoClient.db();
    const fileTouch = await db.collection('files').insertOne(fileName);
    return fileTouch;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
