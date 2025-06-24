const database = require('../../../utils/database');
const {ObjectId} = require('mongodb');
const config = {
	put: {

	}
}

const put = async (req, res) => {
	// update data of an expense

	console.log(req.body);
	const { expenseId } = req.params;
	const { expense } = req.body;

	console.log(expenseId, expense);
	if (!expense) {
		return res.status(400).json({ status: 'error', error: 'Data is required' });
	}
	const result = await database().collection('expenses').updateOne(
		{ _id: new ObjectId(expenseId) },
		{ $set: { data: expense, updatedAt: new Date() } }
	);
	if (result.modifiedCount === 0) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}
	res.status(200).json({ status: 'success', message: 'Expense updated successfully' });
}

module.exports = {
	put,
	config
};