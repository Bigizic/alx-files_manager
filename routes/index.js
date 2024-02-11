/**
 * The file that the server included from.
 */
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController'

const express = require('express');

const app = express();

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
};

export default mapRoutes(app);
module.exports = mapRoutes;
