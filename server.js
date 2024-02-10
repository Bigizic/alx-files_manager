/**
 * Server starter module
 */

const exp = require('express');
const appss = exp();
const portss = process.env.PORT || 5000;
const rout = require('./routes/index');

appss.use(exp.json());
appss.use('/', rout);

appss.listen(portss, () => {
	console.log(`Server running on port ${portss}`);
});

export default appss;
