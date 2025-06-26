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
/** * Retrieves the data of an expense by its ID.
 * * @async
 * * @function get
 * * @param {import('express').Request} req - Express request object. Expects `expenseId` in params.
 * * @param {import('express').Response} res - Express response object.
 * * @returns {Promise<void>} Sends a JSON response with the expense data or an error message.
 * * @description
 * * - Validates that the `expenseId` is provided in the request parameters.
 * * - Checks if the expense with the given ID exists in the database.
 * * - Verifies that the user has permission to access the expense (must be the owner, or have 'owner' or 'hr' role).
 * * - Returns the expense data if found, or appropriate HTTP status codes and messages for errors.
 */
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

/**
 * Updates the data of an existing expense.
 *
 * @async
 * @function post
 * @param {import('express').Request} req - Express request object. Expects `expenseId` in params and `expense` in body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the update operation.
 *
 * @description
 * - Validates that the expense data is provided in the request body.
 * - Checks if the expense with the given ID exists in the database.
 * - Verifies that the user has permission to update the expense (must be the owner, or have 'owner' or 'hr' role).
 * - Updates the expense data, sets the status to 'pending', and updates the `updatedAt` timestamp.
 * - Returns appropriate HTTP status codes and messages for errors and success.
 */
const post = async (req, res) => {
	// update data of an expense

	const { expenseId } = req.params;
	const { expense } = req.body;

	if (!expense) {
		return res.status(400).json({ status: 'error', error: 'Data is required' });
	}

	const expenseData = await database().collection('expenses').findOne({ _id: new ObjectId(expenseId) });

	if (!expenseData) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}

	if (expenseData.userId.toString() !== req.user._id.toString() && req.user.entreprise.role !== 'owner' && req.user.entreprise.role !== 'hr') {
		return res.status(403).json({ status: 'error', error: 'Forbidden' });
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

/**
 * Deletes an existing expense.
 * @async
 * @function del
 * @param {import('express').Request} req - Express request object. Expects `expenseId` in params.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the deletion operation.
 * @description 
 * - Validates that the `expenseId` is provided in the request parameters.
 * - Fetches the expense from the database to verify its existence and ownership.
 * - Checks if the current user is the owner of the expense.	
 * - Deletes the expense if it exists and the user has permission.
 * - Returns appropriate HTTP status codes and messages for errors and success.
 */
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