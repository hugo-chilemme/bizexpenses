const database = require('../../utils/database');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');

const VALID_COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501+'];
const EMAIL_REGEX = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
const config = {
	post: {}
};

const post = async (req, res) => {
	const { firstName, lastName, email, companyName, companySize, password } = req.body;

	// Validation
	if (![firstName, lastName, email, companyName, companySize, password].every(Boolean)) {
		return res.status(400).json({ status: 'error', errorId: 'missing_fields', error: 'All fields are required' });
	}
	if (![firstName, lastName, email, companyName, companySize, password].every(val => typeof val === 'string')) {
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
		uuid: userId, 
		firstName, 
		lastName, 
		email,
		password: bcrypt.hashSync(password, 10),
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
			name: companyName,
			size: companySize,
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: userId,
			users: [{id: userId, role: 'owner'}]
		};
		const entrepriseInsertResult = await database().collection('entreprises').insertOne(entreprise);
		if (!entrepriseInsertResult.acknowledged || !entrepriseInsertResult.insertedId) {
			return res.status(500).json({ status: 'error', errorId: 'entreprise_not_created', error: 'Failed to create entreprise' });
		}	


		const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
		return res.status(201).json({
			status: 'success',
			message: 'User created successfully',
			authorization: `Bearer ${token}`,
			user: {
				_id: insertResult.insertedId,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email
			},
			entrepriseUuid: entrepriseInsertResult.insertedId,
		});
	} catch (err) {
		console.error('Error creating user:', err);
		return res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
	}
};

module.exports = { post, config };
