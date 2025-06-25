const database = require('../../../utils/database');
const fs = require('fs');
const { ObjectId } = require('mongodb');


const config = {
	get: {
		isAuthentified: true,
	}
};

const get = async (req, res) => {
	const { expenseId } = req.params;

	if (!expenseId) {
		return res.status(400).json({ status: 'error', error: 'Expense ID is required' });
	}

	const expense = await database().collection('expenses').findOne({ _id: new ObjectId(expenseId) });

	if (!expense) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}

	if (expense.userId.toString() !== req.user._id.toString() && req.user.entreprise.role === 'user') {
		return res.status(403).json({ status: 'error', error: 'Forbidden' });
	}

	const imagePath = `${process.cwd()}/uploads/${expense.image}`;
	if (!fs.existsSync(imagePath)) {
		return res.status(404).json({ status: 'error', error: 'Image not found' });
	}

	const imageBuffer = fs.readFileSync(imagePath);
	const base64Image = imageBuffer.toString('base64');
	res.json({ status: 'success', image: 'data:image/png;base64,' + base64Image });
}

module.exports = {
	get,
	config
};