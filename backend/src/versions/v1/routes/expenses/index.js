const nScale = require('../../../../utils/nScale');
const database = require('../../utils/database');
const fs = require('fs');
const uuid = require('uuid');
const { ObjectId } = require('mongodb');

const config = {
	get: {
		isAuthentified: true,
	}
};


// Nouvelle fonctionnalité : récupérer toutes les expenses d'un utilisateur
const get = async (req, res) => {
	const userId = req.user._id;
	const items = await database().collection('expenses').find({ userId: new ObjectId(userId) }).toArray();
	res.status(200).json({ status: 'success', items });
};

module.exports = {
	get,
	config
};