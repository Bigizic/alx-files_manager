/**
 * The file that the server included from.
 */
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController'
import AuthController from  '../controllers/AuthController';

const express = require('express');
const UsersController = require('../controllers/UsersController');
const AppController = require('../controllers/AppController');

const router = express.Router();
import UsersController from '../controllers/UsersController';
import AppController from '../controllers/AppController';

/**
 * Contains all endpoints
*/

// eslint-disable-next-line jest/require-hook
router.get('/status', AppController.getStatus);

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UserController.getMe);
};
// eslint-disable-next-line jest/require-hook
router.get('/stats', AppController.getStats);

// eslint-disable-next-line jest/require-hook
router.post('/users', UsersController.postNew);
module.exports = router;
};
export default mapRoutes;
module.exports = mapRoutes;
