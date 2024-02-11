import UsersController from '../controllers/UsersController';
import AppController from '../controllers/AppController';

/**
 * Contains all endpoints
*/

const mapRoutes = (app) => {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
  app.post('/users', UsersController.postNew);
};

export default mapRoutes;
module.exports = mapRoutes;
