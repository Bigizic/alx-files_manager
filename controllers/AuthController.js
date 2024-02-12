/**
 * Authentication of the user.
 */
const mdbClient = require('../utils/db');
const mredisClient = require('../utils/redis');
const { hashpass } = require('./UsersController');
const { uuidv4 } = require('uuid');
const { ObjId } = require('mongodb');

export default class AuthController {
	static async getConnect(request, response) {
		const header = request.headers.authorization;
		const basic = header.split(' ')[1];
		const string = atob(basic);
		const [email, pass] = string.split(':');
		const u = await mdbClient.db.collection('users').findOne({ email });
		if (!u || hashpass(pass) !== u.pass) {
			return response.status(401).send({ error: 'Unauthorized' });
		}
		const randstr = uuidv4();
		const k = `auth_${randstr}`;
		await mredisClient.set(k, u._id.toString(), 86400);
		return response.status(200).send({ token: randstr });
	}

	static async getDisconnect(request, response) {
		const header = request.headers['x-token'];
		const id =  await mredisClient.get(`auth_${header}`);
		const u = await mdbClient.db.collection('users').findOne({ _id: new ObjId(id) });
		if(!u) {
			return response.status(401).send({ error: 'Unauthorized' });
		}
		await mredisClient.del(`auth_${header}`);
		return response.status(204).send();
	}
}

module.exports = AuthController;
