/**
 * The file that the server included from.
 */
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController'
import AuthController from  '../controllers/AuthController';

const express = require('express');

const app = express();

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UserController.getMe);
};

export default mapRoutes(app);
module.exports = mapRoutes;
