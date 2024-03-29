#!/usr/bin/node

// eslint-disable-next-line no-undef
const AppController = require('../controllers/AppController');
// eslint-disable-next-line no-undef
const UsersController = require('../controllers/UsersController');
// eslint-disable-next-line no-undef
const AuthController = require('../controllers/AuthController');
// eslint-disable-next-line no-undef
const FilesController = require('../controllers/FilesController');

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UsersController.getMe);
  app.post('/files', FilesController.postUpload);
  app.get('/files/:id', FilesController.getShow);
  app.get('/files', FilesController.getIndex);
  app.put('/files/:id/publish', FilesController.putPublish);
  app.put('/files/:id/unpublish', FilesController.putUnpublish);
  app.get('/files/:id/data', FilesController.getFile);
};

// eslint-disable-next-line no-undef
module.exports = mapRoutes;
