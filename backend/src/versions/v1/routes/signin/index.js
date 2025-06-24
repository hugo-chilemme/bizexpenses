const database = require('../../utils/database');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');

const config = {
	post: {
		
	}
}

const post = async (req, res) => {
	const { email, password } = req.body;

	// Validation
	if (!email || !password) {
		return res.status(400).json({ status: 'error', errorId: 'missing_fields', error: 'Email and password are required' });
	}
	if (typeof email !== 'string' || typeof password !== 'string') {
		return res.status(400).json({ status: 'error', errorId: 'invalid_types', error: 'Invalid field types' });
	}
	if (email.length < 5 || password.length < 6) {
		return res.status(400).json({ status: 'error', errorId: 'field_too_short', error: 'Email must be at least 5 characters and password at least 6 characters long' });
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

		const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET, { expiresIn: '1h' });

		res.json({
			status: 'success',
			data: {
				authorization: `Bearer ${token}`,
                                user: {
                                        uuid: user.uuid,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                        role: user.role
                                }
			}
		});
	} catch (err) {
		console.error('Error during sign-in:', err);
		res.status(500).json({ status: 'error', errorId: 'internal_error', error: 'Internal server error' });
	}
};

module.exports = {
	post, config
};
