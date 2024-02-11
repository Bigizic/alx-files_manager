import UsersController from '../controllers/UsersController'
import AppController from '../controllers/AppController';

/**
 * The file that the server included from.
*/

const express = require('express');

const app = express();

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
};

export default mapRoutes(app);
module.exports = mapRoutes;
