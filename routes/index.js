/**
 * The file that the server included from.
 */

import AppController from '../controllers/AppController';

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', StudentsController.getStats);
};

export default mapRoutes;
module.exports = mapRoutes;