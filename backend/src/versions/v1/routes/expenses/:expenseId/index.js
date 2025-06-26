const database = require('../../../utils/database');
const {ObjectId} = require('mongodb');
const config = {
	post: {
		isAuthenticated: true,
	},
	get: {
		isAuthenticated: true,
	},
	delete: {
		isAuthenticated: true,
	}
}


const get = async (req, res) => {
	// get data of an expense
	const { expenseId } = req.params;



	if (!expenseId) {
		return res.status(400).json({ status: 'error', error: 'Expense ID is required' });
	}

	const expense = await database().collection('expenses').findOne({ _id: new ObjectId(expenseId) });

	if (expense.userId.toString() !== req.user._id.toString() && req.user.entreprise.role !== 'owner' && req.user.entreprise.role !== 'hr') {
		return res.status(403).json({ status: 'error', error: 'Forbidden' });
	}

	if (!expense) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}

	res.status(200).json({ status: 'success', data: expense });
}

const post = async (req, res) => {
	// update data of an expense

	const { expenseId } = req.params;
	const { expense } = req.body;

	if (!expense) {
		return res.status(400).json({ status: 'error', error: 'Data is required' });
	}
	const result = await database().collection('expenses').updateOne(
		{ _id: new ObjectId(expenseId) },
		{ $set: { data: expense, updatedAt: new Date(), status: 'pending' } }
	);
	if (result.modifiedCount === 0) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}
	res.status(200).json({ status: 'success', message: 'Expense updated successfully' });
}

const del = async (req, res) => {
	console.log( req.user)
	const { expenseId } = req.params;
	if (!expenseId) return res.status(400).json({ status: 'error', error: 'Missing expense ID' });

	// Fetch the expense to verify ownership
	const expense = await database().collection('expenses').findOne({ _id: new ObjectId(expenseId) });
	if (!expense) return res.status(404).json({ status: 'error', error: 'Expense not found' });

	// Check if the current user is the owner
	if (expense.userId.toString() !== req.user._id.toString()) {
		return res.status(403).json({ status: 'error', error: 'Forbidden' });
	}

	const result = await database().collection('expenses').deleteOne({ _id: new ObjectId(id) });
	if (result.deletedCount === 0) return res.status(404).json({ status: 'error', error: 'Expense not found' });

	res.status(200).json({ status: 'success' });
};


module.exports = {
	post,
	get,
	del,
	config
};