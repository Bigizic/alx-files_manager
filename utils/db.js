#!/usr/bin/node

// eslint-disable-next-line no-undef
const { MongoClient } = require('mongodb');

// eslint-disable-next-line no-undef
const mongo = require('mongodb');
// eslint-disable-next-line no-undef
const process = require('process');

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

  /**
   * isAlive - Checks if the mongoClient is connected
   * @returns boolean
   */
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

  /**
   * nbUsers - gets the number of document in the user collection
   * @returns number of documents in the user collection
  */

  async nbUsers() {
    const db = this.mongoClient.db();
    const users = db.collection('users');
    return users.countDocuments();
  }

  /**
   * nbFiles - gets the number of document in the file collection
   * @returns number of documents in the files collection
  */

  async nbFiles() {
    const db = this.mongoClient.db();
    const files = db.collection('files');

    return files.countDocuments();
  }

  /**
   * userExists - checks if a user exists in the user collection
   * @param {string} email
   * @returns boolean
  */

  async userExists(email) {
    const db = this.mongoClient.db();
    const exists = await db.collection('users').findOne({ email });

    return exists;
  }

  /**
   * createUser - creates a user in the users collection
   * @param {Dictionary} newUser
   * @returns newly created user
  */

  async createUser(newUser) {
    const db = this.mongoClient.db();
    const creator = await db.collection('users').insertOne(newUser);

    return creator;
  }

  /**
   * getUserById - fetch a docuement in the users collection by id
   * @param {string} id
   * @returns retrieved user
  */

  async getUserById(id) {
    const db = this.mongoClient.db();
    const _id = new mongo.ObjectId(id);
    const exists = await db.collection('users').findOne({ _id });
    return exists;
  }

  /**
   * getFileById - fetch a document in the files collection by id
   * @param {string} id
   * @returns retrieved file
  */

  async getFileById(id) {
    const db = this.mongoClient.db();
    const _id = new mongo.ObjectId(id);
    const exists = await db.collection('files').findOne({ _id });

    return exists;
  }

  /**
   * createFile - create a document in the files collection
   * @param {string} fileName
   * @returns created File
  */

  async createFile(fileName) {
    const db = this.mongoClient.db();
    const fileTouch = await db.collection('files').insertOne(fileName);
    return fileTouch;
  }

  /**
   * getFilesByParentId - get a document in the files collection by Parent Id attr
   * @param {string} userId
   * @param {string} parentId
   * @param {integer} skip
   * @param {integer} limit
   * @returns retrieved file
  */

  async getFilesByParentId(userId, parentId, skip, limit) {
    const db = this.mongoClient.db();
    const parentObjectId = parentId === 0 ? 0 : parentId;
    const pipeline = [
      {
        $match: {
          userId: new mongo.ObjectId(userId),
          parentId: parentObjectId,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const files = await db.collection('files').aggregate(pipeline).toArray();
    return files;
  }

  /**
   * updateFileById - Updates a mongo document by id
   * @param {string} id
   * @param {Dictionary} updateFields
   * @returns newly updated collection
  */

  async updateFileById(id, updateFields) {
    const db = this.mongoClient.db();
    const filter = { _id: new mongo.ObjectId(id) };
    const updateResult = await db.collection('files').updateOne(filter, { $set: updateFields });

    return updateResult;
  }

  /**
   * getUserByCredentials - retrieve a user by username and password
   * @param {Dictionary} credentials 
   * @returns boolean
   */
  async getUserByCredentials(credentials) {
    const db = this.mongoClient.db();
    const exists = await db.collection('users').findOne(credentials);
    return exists;
  }
}
const dbClient = new DBClient();
module.exports = dbClient;
