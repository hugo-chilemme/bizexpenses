const database = require('../../utils/database');
const bcrypt = require('bcryptjs');
const config = {
	get: {
		isAuthentified: true,
	},
	delete: {
		isAuthentified: true
	}
}

/** * Retrieves the authenticated user's data.
 * @async
 * @function get
 * @param {import('express').Request} req - Express request object, expects user data in `req.user`.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the user's data.
 * @description
 * - Validates that the user is authenticated.
 * - Returns the user's data in the response.
 */
const get = async (req, res) => {

	return res.send({status: 'success', data: req.user});
};

/** * Deletes the authenticated user after verifying the password.
 * @async
 * @function del
 * @param {import('express').Request} req - Express request object, expects `password` in query.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the deletion or an error message.
 * @description
 * - Validates that the password is provided in the request query.
 * - Checks if the user exists and verifies the password.
 * - Deletes the user, their devices, expenses, and removes them from entreprises.
 */
const del = async (req, res) => {
	const { password } = req.query;

	if (!password) {
		return res.status(400).send({ status: 'error', error: 'Mot de passe manquant.' });
	}

	const user = await database().collection('users').findOne({ _id: req.user._id });
	if (!user) {
		return res.status(404).send({ status: 'error', error: 'Utilisateur non trouvé.' });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		return res.status(401).send({ status: 'error', error: 'Mot de passe incorrect.' });
	}

	const isOwnerOfEntreprise = await database().collection('entreprises').findOne({ ownerId: user.uuid });
	if (isOwnerOfEntreprise) {
		return res.status(403).send({ status: 'error', error: 'Vous ne pouvez pas supprimer votre compte car vous êtes le propriétaire de l\'entreprise. Veuillez transférer la propriété de l\'entreprise à un autre utilisateur avant de supprimer votre compte.' });
	}

	await database().collection('users').deleteOne({ _id: user._id });
	await database().collection('devices').deleteMany({ user_uuid: user.uuid });
	await database().collection('expenses').deleteMany({ userId: user._id });

	// Supprimer uniquement cet utilisateur des entreprises où il apparaît
	await database().collection('entreprises').updateMany(
		{ users: user._id },
		{ $pull: { users: user._id } }
	);


	return res.send({ status: 'success' });
};

module.exports = {
	get,
	del,
	config
};