#!/usr/bin/node

import mapRoutes from './routes';
import express from 'express';

/**
 * Server starter module
*/

const appss = express();
const portss = process.env.PORT || 5000;

// eslint-disable-next-line jest/require-hook
appss.use(express.json({ limit: '200mb' }));

// eslint-disable-next-line jest/require-hook
mapRoutes(appss);

// eslint-disable-next-line jest/require-hook
appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

export default appss;
