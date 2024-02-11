const exp = require('express');
const routes = require('./routes');

/**
 * Server starter module
*/

const appss = exp();
const portss = process.env.PORT || 5000;

// eslint-disable-next-line jest/require-hook
appss.use(exp.json());
// eslint-disable-next-line jest/require-hook
appss.use(routes);

// eslint-disable-next-line jest/require-hook
appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

export default appss;
