#!/usr/bin/node

import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

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
      data: req.body.type.includes(['file', 'image']) ? req.body.data : null,
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
}
