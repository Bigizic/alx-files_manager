#!/usr/bin/node

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import Queue from 'bull/lib/queue';

const mime = require('mime-types');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

export default class FilesController {
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
      data: ['file', 'image'].includes(req.body.type) ? req.body.data : null,
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

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const header = req.headers['x-token'];
    const headerId = await redisClient.get(`auth_${header}`);
    const user = await dbClient.getUserById(headerId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.getFileById(id);
    console.log(file);

    if (!file || file.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.updateFileById(id, { isPublic: false });

    const updatedFile = await dbClient.getFileById(id);

    return res.json(updatedFile);
  }

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
