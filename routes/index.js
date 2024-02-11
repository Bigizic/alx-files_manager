const express = require('express');
const UsersController = require('../controllers/UsersController');
const AppController = require('../controllers/AppController');

const router = express.Router();

/**
 * Contains all endpoints
*/

// eslint-disable-next-line jest/require-hook
router.get('/status', AppController.getStatus);

// eslint-disable-next-line jest/require-hook
router.get('/stats', AppController.getStats);

// eslint-disable-next-line jest/require-hook
router.post('/users', UsersController.postNew);
module.exports = router;
