#!/usr/bin/node

// eslint-disable-next-line no-undef
const express = require('express');
// eslint-disable-next-line no-undef
const process = require('process');
// eslint-disable-next-line no-undef
const mapRoutes = require('./routes');

const appss = express();
const portss = process.env.PORT || 5000;

appss.use(express.json({ limit: '200mb' }));

mapRoutes(appss);

appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

// export default appss;
