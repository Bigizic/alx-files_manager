/**
 * Authentication of the user.
 */
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { sha1 } = require('sha1');
const { uuidv4 } = require('uuid');
 
