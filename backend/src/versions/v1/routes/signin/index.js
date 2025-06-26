const database = require('../../utils/database');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const mailCreator = require('../../utils/mailCreator');

const config = {
	post: {
		
	},
	put: {
	}
}
/** * Handles user sign-in by validating credentials, generating a JWT token, and managing device trust.
 * * @async
 * * @function post
 * * @param {import('express').Request} req - Express request object, expects `email`, `password`, `userAgent`, `platform`, `language`, and `deviceId`
 * * @param {import('express').Response} res - Express response object.
 * * @returns {Promise<void>} Sends a JSON response with the authorization token and user details or an error message.
 * * @description
 * * - Validates the presence and types of required fields in the request body.
 * * - Checks if the user exists in the database and verifies the password.
 * * - Generates a JWT token for the user and checks if the device is already trusted.		
 * * - If the device is not trusted, it deletes all previous entries for that device ID and sends a security alert email.
 * * - Inserts a new device entry with the token and user details, setting the device as trusted if it was already trusted.
 * * - Returns the authorization token and user details in the response.
 * * - Handles errors and returns appropriate HTTP status codes and messages for various failure scenarios.
 */
const post = async (req, res) => {
	const { email, password, userAgent, platform, language, deviceId } = req.body;

	if (!email || !password || !userAgent || !platform || !language || !deviceId) {
		return res.status(400).json({ status: 'error', errorId: 'missing_fields', error: 'All fields are required' });
	}
	if (
		typeof email !== 'string' ||
		typeof password !== 'string' ||
		typeof userAgent !== 'string' ||
		typeof platform !== 'string' ||
		typeof language !== 'string' ||
		typeof deviceId !== 'string'
	) {
		return res.status(400).json({ status: 'error', errorId: 'invalid_types', error: 'Invalid field types' });
	}
	if (email.length < 5 || password.length < 6 || userAgent.length < 1 || platform.length < 1 || language.length < 2 || deviceId.length < 1) {
		return res.status(400).json({ status: 'error', errorId: 'field_too_short', error: 'One or more fields are too short' });
	}

	try {
		const user = await database().collection('users').findOne({ email });
		if (!user) {
			return res.status(401).json({ status: 'error', errorId: 'user_not_found', error: 'User not found' });
		}

		const isPasswordValid = bcrypt.compareSync(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ status: 'error', errorId: 'invalid_password', error: 'Invalid password' });
		}

		const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, { expiresIn: '30d' });

		const isDeviceAlreadyTrusted = await database().collection('devices').findOne({ deviceId, user_uuid: user.uuid, trusted: true });

		const deleteAllDeviceWithSameId = await database().collection('devices').deleteMany({ deviceId, user_uuid: user.uuid });

		const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
		
		const random64charConfirmToken = uuid.v4().replace(/-/g, '').substring(0, 64);

		if (deleteAllDeviceWithSameId.deletedCount === 0)
		{
			const securityAlert = new mailCreator();
			securityAlert.setSubject(`A new device has been used to sign in to your BizExpenses account`);
			securityAlert.setText(`Hello ${user.firstName} ${user.lastName},\n\nA new device has been used to sign in to your BizExpenses account.\nIf this was not you, please contact support immediately.\n\nDevice ID: ${deviceId}\nUser Agent: ${userAgent}\nPlatform: ${platform}\nLanguage: ${language}\nIP Address: ${ip_address}\n\nTo verify this device, please visit the following link:\nhttps://bizexpenses.hugochilemme.com/two-factor/${random64charConfirmToken}\n\nBest regards,\nThe BizExpenses Team`);
			securityAlert.setRecipients(user.email);
			securityAlert.send();
		}

		console.log(isDeviceAlreadyTrusted ? 'Device is already trusted' : 'Device is not trusted, creating new device entry');

		// Always set trusted to true after successful login
		await database().collection('devices').insertOne({
			token,
			user_uuid: user.uuid,
			deviceId,
			userAgent,
			randomConfirmToken: random64charConfirmToken,
			platform,
			ip_address,
			language,
			createdAt: new Date(),
			lastUsedAt: new Date(),
			trusted: isDeviceAlreadyTrusted
		});

		res.json({
			status: 'success',
			data: {
				authorization: `Bearer ${token}`,
				user: {
					uuid: user.uuid,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					trusted: isDeviceAlreadyTrusted
				}
			}
		});
	} catch (err) {
		console.error('Error during sign-in:', err);
		res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
	}
};

/**
 * 	* Handles password reset requests by generating a reset token and sending an email to the user.
 * * 	* @async
 * * 	* @function put
 * * 	* @param {import('express').Request} req - Express request object, expects `email` in query.
 * * 	* @param {import('express').Response} res - Express response object.
 * * 	* @returns {Promise<void>} Sends a JSON response with the status of the password reset request or an error message.
 * * 	* @description
 * * 	* - Validates the presence of the `email` query parameter.
 * * 	* - Checks if the user exists in the database.
 * * 	* - Generates a random reset token and updates the user's record in the database.
 * * 	* - Sends a password reset email to the user with a link to set a new password.
 * * 	* - Handles errors and returns appropriate HTTP status codes and messages for various failure scenarios.
 */
const put = async (req, res) => {
	// reset password
	const { email } = req.query;

	if (!email) {
		return res.status(400).json({ status: 'error', errorId: 'missing_email', error: 'Email is required' });
	}

	try {
		const user = await database().collection('users').findOne({ email });
		if (!user) {
			return res.status(404).json({ status: 'error', errorId: 'user_not_found', error: 'User not found' });
		}	

		const resetToken = require('crypto').randomBytes(64).toString('hex');
		await database().collection('users').updateOne({ email }, { $set: { reset_token: resetToken } });

		const mail = new mailCreator();
		mail.setSubject('Password Reset Request');
		mail.setText(`Hello ${user.firstName} ${user.lastName},\n\nWe received a request to reset your password for your BizExpenses account.\nPlease follow the link below to set a new password:\n\nhttps://bizexpenses.hugochilemme.com/set-auth/${resetToken}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nThe BizExpenses Team`);
		mail.setRecipients(email);
		mail.send();
		return res.status(200).json({ status: 'success', message: 'Password reset email sent' });
	} catch (err) {
		console.error('Error during password reset:', err);
		return res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
	}
};



module.exports = {
	post, put, config
};
