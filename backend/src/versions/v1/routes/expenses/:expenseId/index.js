const database = require('../../../utils/database');
const {ObjectId} = require('mongodb');
const config = {
	post: {
		isAuthenticated: true,
	}
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

module.exports = {
	post,
	config
};