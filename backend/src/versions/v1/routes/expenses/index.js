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


const get = async (req, res) => {
	const { status } = req.query;

	// Helper to fetch user info for a list of expenses
	const addUserInfo = async (items) => {
		const userIds = [...new Set(items.map(item => item.userId?.toString()))].filter(Boolean);
		const users = await database().collection('users').find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }).toArray();
		const userMap = {};
		users.forEach(u => {
			userMap[u._id.toString()] = {
				firstName: u.firstName,
				lastName: u.lastName,
				email: u.email,
				uuid: u.uuid,
			};
		});
		return items.map(item => ({
			...item,
			user: userMap[item.userId?.toString()] || null
		}));
	};

	if (status && ['preparing', 'pending', 'accepted', 'rejected', 'all'].includes(status)) {
		if (req.user.entreprise.role === "user")
			return res.status(403).json({ status: 'error', error: 'Forbidden' });
		let items;
		if (status === 'all' && req.user.entreprise.role !== "user") {
			items = await database().collection('expenses').find({ status: { $in: ['pending', 'accepted', 'rejected'] } }).toArray();
		} else {
			items = await database().collection('expenses').find({ userId: new ObjectId(req.user._id), status }).toArray();
		}
		items = await addUserInfo(items);
		return res.status(200).json({ status: 'success', items });
	}

	const userId = req.user._id;
	let items = await database().collection('expenses').find({ userId: new ObjectId(userId), status: { $ne: 'preparing' } }).toArray();
	items = await addUserInfo(items);
	res.status(200).json({ status: 'success', items });
};


module.exports = {
	get,
	config
};