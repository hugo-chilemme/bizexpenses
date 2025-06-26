const database = require('../../../utils/database');
const { ObjectId } = require('mongodb');
const mailCreator = require('../../../utils/mailCreator');

const config = {
	put: {
		isAuthenticated: true,
		_entreprise_roles: ['owner', 'hr'],
	},
	get: {
		isAuthenticated: true,
	}
}

/** * Retrieves the details of an expense by its ID.
 * * @async
 * * @function get
 * * @param {import('express').Request} req - Express request object, expects `expenseId` in params.
 * * @param {import('express').Response} res - Express response object.
 * * @returns {Promise<void>} Sends a JSON response with the expense details or an error message.
 * * @description	
 * * - Validates that the `expenseId` is provided in the request parameters.
 * * - Checks if the expense with the given ID exists in the database.
 * * - Retrieves the user associated with the expense.
 * * - Returns the expense details along with user information if found, or appropriate HTTP status codes and messages for errors.
 */
const get = async (req, res) => {
	const { expenseId } = req.params;
	if (!expenseId) {
		return res.status(400).json({ status: 'error', error: 'Expense ID is required' });
	}

	const expense = await database().collection('expenses').findOne({ _id: new ObjectId(expenseId) });
	if (!expense) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}
	const userExpense = await database().collection('users').findOne({ _id: new ObjectId(expense.userId) });	
	if (!userExpense) {
		return res.status(404).json({ status: 'error', error: 'User not found' });
	}

	res.status(200).json({
		status: 'success',
		data: {
			id: expense._id,
			status: expense.status,
			createdAt: expense.createdAt,
			updatedAt: expense.updatedAt,	
			image: expense.image,
			data: expense.data,
			user: {
				id: userExpense._id,
				name: userExpense.name,
				email: userExpense.email,
				company: userExpense.company,
			}
		}
	});
}


/**
 * Updates the status of an expense by its ID.
 *
 * @async
 * @function put
 * @param {import('express').Request} req - Express request object, expects `expenseId` in params and `status` in query.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the result of the update operation.
 *
 * @throws {400} If `expenseId` or `status` is missing, or if `status` is invalid.
 * @throws {404} If the expense is not found.
 *
 * @description
 * This function validates the provided expense ID and status, checks if the expense exists,
 * updates its status in the database, and sends an email notification to the user associated
 * with the expense. Responds with appropriate HTTP status codes and messages based on the outcome.
 */
const put = async (req, res) => {
	const { expenseId } = req.params;
	const { status } = req.query;

	if (!expenseId || !status) {
		return res.status(400).json({ status: 'error', error: 'Expense ID and status are required' });
	}

	const validStatuses = ['pending', 'approved', 'rejected'];
	if (!validStatuses.includes(status)) {
		return res.status(400).json({ status: 'error', error: 'Invalid status' });
	}

	const expense = await database().collection('expenses').findOne({ _id: new ObjectId(expenseId) });

	if (!expense) {
		return res.status(404).json({ status: 'error', error: 'Expense not found' });
	}
	const userExpense = await database().collection('users').findOne({ _id: new ObjectId(expense.userId) });

	const result = await database().collection('expenses').updateOne(
		{ _id: new ObjectId(expenseId) },
		{ $set: { status, updatedAt: new Date() } }
	);

	if (result.modifiedCount === 0) {
		return res.status(404).json({ status: 'error', error: 'Expense not found or no changes made' });
	}
	const mail = new mailCreator();
	mail.setSubject(`Your expense status has been updated to ${status}`);
	mail.setText(
		`Dear user,
\n\n
Your expense has been updated to "${status}".
\n\n
Expense details:
- Amount: ${expense.data.total_ttc.value || 'N/A'}
- Date: ${expense.data.date.value ? new Date(expense.data.date.value).toLocaleDateString() : 'N/A'}
\n\n
Thank you for using our service.`
	);
	mail.setRecipients(userExpense.email);
	mail.send();
	

	res.status(200).json({ status: 'success', message: 'Expense status updated successfully' });
}

module.exports = {
	put,
	get,
	config
};