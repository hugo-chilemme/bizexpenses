const database = require('../../utils/database');



const config = {
	post: {

	},
	put: {
		
	}
}

/** * Handles device trust confirmation via UUID, deviceId, and token.
 * @async
 * @function post
 * @param {import('express').Request} req - Express request object, expects `uuid`, `deviceId`, and `token` in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the trust confirmation or an error message.
 * @description
 * - Validates the presence and types of required fields in the request body.
 * - Checks if the device exists in the database.
 * - Updates the device record to set it as trusted.
 */
const post = async (req, res) => {
	const { uuid, deviceId, token } = req.body;

	if (!uuid || !deviceId || !token) {
		return res.status(400).json({ status: 'error', errorId: 'missing_fields', error: 'All fields are required' });
	}
	if (typeof uuid !== 'string' || typeof deviceId !== 'string' || typeof token !== 'string') {
		return res.status(400).json({ status: 'error', errorId: 'invalid_types', error: 'Invalid field types' });
	}
	if (uuid.length !== 32 || deviceId.length < 1 || token.length <	 1) {
		return res.status(400).json({ status: 'error', errorId: 'field_too_short', error: 'One or more fields are too short' });
	}


	const device = await database().collection('devices').findOne({ user_uuid: uuid, deviceId, token });

	if (!device) {
		return res.status(401).json({ status: 'error', errorId: 'device_not_found', error: 'Device not found' });
	}

	console.log('Device found:', device);
	if (!device.trusted) {
		return res.status(400).json({ status: 'error', errorId: 'device_not_trusted', error: 'Device is not trusted' });
	}

	
	const updateResult = await database().collection('devices').updateOne(
		{ user_uuid: uuid, deviceId, token },
		{ $set: device }
	);	

	return res.status(200).json({ status: 'success', message: 'Device trusted successfully' });
};

/** * Handles device trust confirmation via a random token.
 * @async
 * @function put
 * @param {import('express').Request} req - Express request object, expects `token` in query.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the trust confirmation or an error message.
 * @description
 * - Validates the presence of the `token` query parameter.
 * - Checks if the device exists in the database.
 * - Updates the device record to set it as trusted.
 */
const put = async (req, res) => {
	const { token } = req.query;

	if (!token) {
		return res.status(400).json({ status: 'error', errorId: 'missing_token', error: 'Token is required' });
	}

	if (typeof token !== 'string') {
		return res.status(400).json({ status: 'error', errorId: 'invalid_token', error: 'Invalid token type' });
	}

	if (token.length < 1) {
		return res.status(400).json({ status: 'error', errorId: 'token_too_short', error: 'Token is too short' });
	}

	const device = await database().collection('devices').findOne({ randomConfirmToken: token });

	if (!device) {
		return res.status(404).json({ status: 'error', errorId: 'device_not_found', error: 'Device not found' });
	}

	console.log('Device found:', device);
	if (device.trusted) {
		return res.status(400).json({ status: 'error', errorId: 'device_not_trusted', error: 'Device is not trusted' });
	}

	const updateResult = await database().collection('devices').updateOne(
		{ randomConfirmToken: token },
		{ $set: { trusted: true } }
	);


	return res.status(200).json({ status: 'success', message: 'Device trusted successfully' });
};

module.exports = { post, put, config };