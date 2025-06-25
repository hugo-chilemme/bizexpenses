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
