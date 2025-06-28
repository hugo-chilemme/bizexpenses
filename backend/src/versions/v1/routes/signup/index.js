const database = require('../../utils/database');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const mailCreator = require('../../utils/mailCreator')

const VALID_COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501+'];
const EMAIL_REGEX = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
const config = {
	post: {},
	get: {},
	put: {}
};

/** * Handles user registration by validating input, creating a new user and entreprise, and sending confirmation emails.
 * @async
 * @function post
 * @param {import('express').Request} req - Express request object, expects user details in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the registration or an error message.
 * @description
 * - Validates the presence and types of required fields in the request body.
 * - Checks if the user already exists in the database.
 */
const post = async (req, res) => {
	const { firstName, lastName, email, companyName, companySize, password, userAgent, platform, language, deviceId } = req.body;

	// Validation
	if (![firstName, lastName, email, companyName, companySize, password, userAgent, platform, language, deviceId].every(Boolean)) {
		return res.status(400).json({ status: 'error', errorId: 'missing_fields', error: 'All fields are required' });
	}
	if (![firstName, lastName, email, companyName, companySize, password, userAgent, platform, language, deviceId].every(val => typeof val === 'string')) {
		return res.status(400).json({ status: 'error', errorId: 'invalid_types', error: 'Invalid field types' });
	}
	if ([firstName, lastName, companyName, password].some(val => val.length < 2) || companySize.length < 1) {
		return res.status(400).json({ status: 'error', errorId: 'field_too_short', error: 'Fields must be at least 2 characters long' });
	}
	if (!EMAIL_REGEX.test(email)) {
		return res.status(400).json({ status: 'error', errorId: 'invalid_email', error: 'Invalid email format' });
	}
	if (!VALID_COMPANY_SIZES.includes(companySize)) {
		return res.status(400).json({ status: 'error', errorId: 'invalid_company_size', error: 'Invalid company size' });
	}



        const userId = uuid.v4().replace(/-/g, '');
        const user = {
			active: true,
			uuid: userId,
			firstName,
			lastName,
			email,
			password: bcrypt.hashSync(password, 10),
			role: 'admin',
        };

	try {

		// check if user already exists
		const existingUser = await database().collection('users').findOne({ email });
		if (existingUser) {
			return res.status(400).json({ status: 'error', errorId: 'user_exists', error: 'User already exists' });
		}

		const insertResult = await database().collection('users').insertOne(user);
		if (!insertResult.acknowledged || !insertResult.insertedId) {
			return res.status(500).json({ status: 'error', errorId: 'user_not_created', error: 'Failed to create user' });
		}

		if (!process.env.JWT_SECRET) {
			console.error('JWT_SECRET environment variable is not set');
			return res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
		}


		// create entreprise
		const entreprise = {
			uuid: uuid.v4().replace(/-/g, ''),
			name: companyName.toLowerCase(),
			size: companySize.toLowerCase(),
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: userId,
			rules: {
				submission_deadline: 30,
				alloweds_categories: [
					'transports',
					'restauration',
					'hotel',
					'fournitures',
					'alcools',
					'autres'
				],
				limits: {
					transports: 25,
					restauration: 25,
					hotel: 25,
					fournitures: 25,
					alcools: 25,
					autres: 25
				}
			},
			users: [{id: userId, role: 'owner'}]
		};
		const entrepriseInsertResult = await database().collection('entreprises').insertOne(entreprise);
		if (!entrepriseInsertResult.acknowledged || !entrepriseInsertResult.insertedId) {
			return res.status(500).json({ status: 'error', errorId: 'entreprise_not_created', error: 'Failed to create entreprise' });
		}	

		const mail = new mailCreator();
		mail.setSubject('Welcome to BizExpenses - Your account has been created');
		mail.setRecipients(email);
		mail.setText(`Hello ${firstName} ${lastName},\n\nYour account has been successfully created on BizExpenses.\n\nYou can now log in with your email: ${email} and the password you provided during registration.\n\nBest regards,\nThe BizExpenses Team`);
		mail.send();


		// new other mail creation of the entreprise
		const entrepriseMail = new mailCreator();
		entrepriseMail.setSubject(`Your entreprise ${companyName} has been created`);
		entrepriseMail.setRecipients(email);
		entrepriseMail.setText(`Hello ${firstName} ${lastName},\n\nYour entreprise "${companyName}" has been successfully created on BizExpenses.\n\nBest regards,\nThe BizExpenses Team`);
		entrepriseMail.send();

		const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
		const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });

		await database().collection('devices').insertOne({
			token,
			user_uuid: user.uuid,
			deviceId,
			userAgent,
			platform,
			ip_address,
			language,
			createdAt: new Date(),
			lastUsedAt: new Date(),
			trusted: true
		});


		return res.status(201).json({
			status: 'success',
			data: {
				authorization: `Bearer ${token}`,
				user: {
					uuid: user.uuid,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					trusted: true
				}
			}
		});
	} catch (err) {
		console.error('Error creating user:', err);
		return res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
	}
};

/** * Retrieves user information based on the reset token.
 * @async
 * @function get
 * @param {import('express').Request} req - Express request object, expects `resettoken` in query.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user information or an error message.
 * @description
 * - Validates the presence of the `resettoken` query parameter.
 * - Checks if a user with the provided reset token exists in the database.
 * - Returns the user's ID and first name if found, or appropriate HTTP status codes and messages for errors.
 */
const get = async (req, res) => {
	// check if the user can register 
	const { resettoken } = req.query;
	if (!resettoken) {
		return res.status(400).json({ status: 'error', errorId: 'missing_reset_token', error: 'Reset token is required' });
	}

	const userExist = await database().collection('users').findOne({ reset_token: resettoken });

	if (!userExist) {
		return res.status(404).json({ status: 'error', errorId: 'user_not_found', error: 'User not found' });
	}

	return res.status(200).json({
		status: 'success',
		data: {
			userId: userExist.uuid,
			firstName: userExist.firstName
		}
	});
};

/** * Updates the user's password based on the reset token.
 * @async
 * @function put
 * @param {import('express').Request} req - Express request object, expects `resettoken` and `password` in query.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the password update or an error message.
 * @description	
 * - Validates the presence of the `resettoken` and `password` query parameters.
 * - Checks if the user with the provided reset token exists in the database.
 * - Hashes the new password and updates the user's record in the database.
 * - Returns appropriate HTTP status codes and messages for errors and success.
 */
const put = async (req, res) => {
	// receive password
	const { resettoken, password } = req.query;

	if (!resettoken || !password) {
		return res.status(400).json({ status: 'error', errorId: 'missing_fields', error: 'Reset token and password are required' });
	}
	if (password.length < 6) {
		return res.status(400).json({ status: 'error', errorId: 'password_too_short', error: 'Password must be at least 6 characters long' });
	}
	
	const user = await database().collection('users').findOne({ reset_token: resettoken });
	if (!user || !user.reset_token) {
		return res.status(404).json({ status: 'error', errorId: 'user_not_found', error: 'User not found' });
	}

	const hashedPassword = bcrypt.hashSync(password, 10);

	try {
		const updateResult = await database().collection('users').updateOne(
			{ reset_token: resettoken },
			{ $set: { password: hashedPassword, reset_token: null } }
		);
		if (updateResult.modifiedCount === 0) {
			return res.status(500).json({ status: 'error', errorId: 'password_not_updated', error: 'Failed to update password' });
		}
		return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
	} catch (err) {
		console.error('Error updating password:', err);
		return res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
	}
	
};

module.exports = { post, get, put, config };
