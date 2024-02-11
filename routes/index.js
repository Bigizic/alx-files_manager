/**
 * The file that the server included from.
 */
const express = require('express');
import AppController from '../controllers/AppController';

const app = express();

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};

export default mapRoutes;
module.exports = mapRoutes;