#!/usr/bin/node

// eslint-disable-next-line no-undef
const { v4: uuidv4 } = require('uuid');
// eslint-disable-next-line no-undef
const fs = require('fs');
// eslint-disable-next-line no-undef
const mime = require('mime-types');
// eslint-disable-next-line no-undef
const path = require('path');
// eslint-disable-next-line no-undef
const process = require('process');
// eslint-disable-next-line no-undef
const Queue = require('bull/lib/queue');
// eslint-disable-next-line no-undef
const dbClient = require('../utils/db');
// eslint-disable-next-line no-undef
const redisClient = require('../utils/redis');

class FilesController {
  /**
   * postUpload - allows an authorized user to upload a file
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns details of uploaded file
  */

  static async postUpload(req, res) {
    const header = req.headers['x-token'];
    const id = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(id);
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const fileDetails = {
      name: req.body.name,
      type: req.body.type,
      parentId: req.body.parentId ? req.body.parentId : 0,
      isPublic: req.body.isPublic ? req.body.isPublic : false,
    };
    if (!fileDetails.name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!fileDetails.type || !['folder', 'file', 'image'].includes(fileDetails.type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (!fileDetails.data && fileDetails.type !== 'folder') {
      return res.status(400).json({ error: 'Missing data' });
    }
    fileDetails.data = req.body.type.includes(['file', 'image']) ? req.body.data : null;

    if (fileDetails.parentId !== 0) {
      const idResult = await dbClient.getFileById(fileDetails.parentId);
      if (!idResult) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (idResult.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    fileDetails.userId = user._id;
    if (fileDetails.type === 'folder') {
      const newFolder = await dbClient.createFile(fileDetails);
      const createdFile = {
        id: newFolder.insertedId,
        userId: fileDetails.userId,
        name: fileDetails.name,
        type: fileDetails.type,
        isPublic: fileDetails.isPublic,
        parentId: fileDetails.parentId,
      };
      return res.status(201).json(createdFile);
    }
    const localPath = path.join(folderPath, `${uuidv4()}.txt`);
    // eslint-disable-next-line no-undef
    const fileData = Buffer.from(fileDetails.data, 'base64');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(localPath, fileData);

    fileDetails.localPath = localPath;

    const newFile = await dbClient.createFile(fileDetails);

    // start generating thumbnails for a file of type image
    if (newFile.type === 'image') {
      const newFIleUserId = newFile.userId;
      const newFileId = newFile._id;
      const jobName = `Image thumbnail [${newFile.userId}-${newFile._id}]`;
      const fileQueue = new Queue('thumbnail generation');
      fileQueue.add({ newFIleUserId, newFileId, name: jobName });
    }

    const createdFile = {
      id: newFile.insertedId,
      userId: fileDetails.userId,
      name: fileDetails.name,
      type: fileDetails.type,
      isPublic: fileDetails.isPublic,
      parentId: fileDetails.parentId,
    };
    return res.status(201).json(createdFile);
  }

  /**
   * getShow - fetch a file in the files collection known to a user
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns a file if known to authorized user
  */

  static async getShow(req, res) {
    const { id } = req.params;
    const header = req.headers['x-token'];
    const headerId = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(headerId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fetchFile = await dbClient.getFileById(id);

    if (!fetchFile || user._id.toString() !== fetchFile.userId.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json(fetchFile);
  }

  /** getIndex - lookup files and folders known to a user
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns all files and folders known to a user
  */

  static async getIndex(req, res) {
    const header = req.headers['x-token'];
    const headerId = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(headerId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;
    const skip = page * limit;

    const files = await dbClient.getFilesByParentId(user._id, parentId, skip, limit);
    return res.json(files);
  }

  /**
   * putPublish - publish a file. Change it's isPublic attr to true
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns newly updated file
  */

  static async putPublish(req, res) {
    const { id } = req.params;
    const header = req.headers['x-token'];
    const headerId = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(headerId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.getFileById(id);

    if (!file || file.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.updateFileById(id, { isPublic: true });

    const updatedFile = await dbClient.getFileById(id);

    return res.json(updatedFile);
  }

  /**
   * putUnpublish - unpublish a file. Change it's isPublic attr to false
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns newly updated file
  */

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const header = req.headers['x-token'];
    const headerId = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(headerId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.getFileById(id);

    if (!file || file.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.updateFileById(id, { isPublic: false });

    const updatedFile = await dbClient.getFileById(id);

    return res.json(updatedFile);
  }

  /**
   * getFile - sends the mime content of an image to client
   * @param {Request object} req
   * @param {HTTP Response} res
   * @returns FilePath of  image
  */

  static async getFile(req, res) {
    const { id } = req.params;
    const header = req.headers['x-token'];
    const headerId = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(headerId);
    // accepts querey parameter size
    const size = req.query.size || null;

    if (!user) {
      return res.status(404).json({ error: 'Unauthorized' });
    }
    const file = await dbClient.getFileById(id);

    if (!file || (!file.isPublic && file.userId.toString() !== user._id.toString())) {
      return res.status(404).json({ error: 'Not found' });
    }
    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }
    let filePath = file.localPath;
    console.log(filePath);
    if (size) { filePath = `${file.localPath}_${size}`; }
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.contentType(file.name);
    // const fileContent = fs.readFileSync(filePath, 'utf8');

    res.setHeader('Content-Type', mimeType || 'text/plain; charset=utf-8');
    return res.status(200).sendFile(filePath);
  }
}
// eslint-disable-next-line no-undef
module.exports = FilesController;
