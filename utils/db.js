#!/usr/bin/node

const { MongoClient } = require('mongodb');

/**
 * DBClient module - creates a client to Mongodb
 */

export default class DBClient {
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
    if (!this.db) {
      console.error('Database connection is not established.');
      return;
    }

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
}

const dbClient = new DBClient();
module.exports = dbClient;
