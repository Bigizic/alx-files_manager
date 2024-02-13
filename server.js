#!/usr/bin/node

import mapRoutes from './routes/index';

const express = require('express');

/**
 * Server starter module
*/

const appss = express();
const portss = process.env.PORT || 5000;

// eslint-disable-next-line jest/require-hook
appss.use(express.json());

// eslint-disable-next-line jest/require-hook
mapRoutes(appss);

// eslint-disable-next-line jest/require-hook
appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

export default appss;
