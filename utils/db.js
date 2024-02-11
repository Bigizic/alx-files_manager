import mongodb from 'mongodb';

/**
 * DBClient module - creates a client to Mongodb
 */

export default class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const db = process.env.DB_DATABASE || 'files_manager';
    const uri = `mongodb://${host}:${port}/${db}`;
    this.mongoClient = new mongodb.MongoClient(uri, { useUnifiedTopology: true });
    this.mongoClient.connect().then(() => {
      this.db = this.mongoClient.db(`${db}`);
    }).catch((e) => {
      console.log(e);
    });
  }

  isAlive() {
    return this.mongoClient.isConnected();
  }

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

const mdbClient = new DBClient();
module.exports = mdbClient;
