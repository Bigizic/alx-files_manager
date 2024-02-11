/**
 * The file that the server included from.
 */
import AppController from '../controllers/AppController';

const express = require('express');

const app = express();

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};

export default mapRoutes(app);
module.exports = mapRoutes;
