import { express } from 'express';
import mapRoutes from './routes';

/**
 * Server starter module
*/

const appss = express();
const portss = process.env.PORT || 5000;

// eslint-disable-next-line jest/require-hook
appss.use(appss.json());

// eslint-disable-next-line jest/require-hook
appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

// eslint-disable-next-line jest/require-hook
mapRoutes(appss);
export default appss;
