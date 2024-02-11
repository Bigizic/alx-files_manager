const exp = require('express');

/**
 * Server starter module
*/

const appss = exp();
const portss = process.env.PORT || 5000;
const rout = require('./routes/index');

// eslint-disable-next-line jest/require-hook
appss.use(exp.json());
// eslint-disable-next-line jest/require-hook
appss.use('/', rout);

// eslint-disable-next-line jest/require-hook
appss.listen(portss, () => {
  console.log(`Server running on port ${portss}`);
});

export default appss;
