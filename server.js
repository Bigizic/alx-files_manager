#!/usr/bin/node

const express = require('express');
const mapRoutes = require('./routes/index');

/**
 * Server starter module
*/

const appss = express();
const portss = process.env.PORT || 5000;

// eslint-disable-next-line jest/require-hook
mapRoutes(appss);

// eslint-disable-next-line jest/require-hook
appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

export default appss;
