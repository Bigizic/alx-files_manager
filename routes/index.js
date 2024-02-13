#!/usr/bin/node

// const AppController = require('../controllers/AppController');
// const UsersController = require('../controllers/UsersController');
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from  '../controllers/AuthController';

/**
 * Contains all endpoints
*/

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  // app.get('/users/me', UserController.getMe);
};

export default mapRoutes;
