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

const get = async (req, res) => {

	return res.send({status: 'success', data: req.user});
};

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