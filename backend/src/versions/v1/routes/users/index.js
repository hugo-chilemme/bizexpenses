const database = require('../../utils/database');
const mailCreator = require('../../utils/mailCreator')

const config = {
    get: {
        isAuthentified: true,
        _entreprise_roles: ['owner', 'hr'],
    },
    post: {
        isAuthentified: true,
        _entreprise_roles: ['owner', 'hr'],
    },
    delete: {
        isAuthentified: true,
        _entreprise_roles: ['owner', 'hr'],
    },
    put: {
        isAuthentified: true,
        _entreprise_roles: ['owner'],
    }
};

/** * Retrieves the list of employees for the authenticated entreprise.
 * @async
 * @function get
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of employees or an error message.
 * @description 
 * - Fetches the entreprise associated with the authenticated user.
 * - Retrieves the list of users associated with the entreprise.
 * - For each user, fetches additional details like first name, last name, email, and active status.
 * - Returns the list of employees in the response.
 * * If an error occurs during the process, it logs the error and returns a 500 status with an error message.
 */
const get = async (req, res) => {
    try {
        const entreprise = await database().collection('entreprises').findOne({ "uuid": req.user.entreprise.uuid });

        for (const user of entreprise.users) {
            const uid = await database().collection('users').findOne({ uuid: user.id });
            if (uid) {
                user.firstName = uid.firstName;
                user.lastName = uid.lastName;
                user.email = uid.email;
                user.active = uid.active;
            }
        }


        return res.status(200).json({ status: 'success', data: entreprise.users });
    } catch (err) {
        console.error('Error fetching employees:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to fetch employees' });
    }
    // Default: return only the current user
    return res.status(200).json({ status: 'success', data: req.user });
};

/** * Creates a new user and sends an invitation email.
 * @async
 * @function post
 * @param {import('express').Request} req - Express request object, expects user details in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the user creation or an error message.
 * @description
 * - Validates the presence of required fields in the request body (firstName, lastName, email).
 * - Checks if the entreprise associated with the authenticated user exists.    
 * - Checks if a user with the provided email already exists.
 * - Creates a new user with the provided details and a generated reset token.
 * * - Sends an invitation email to the new user with a link to complete their registration.
 * * - Adds the new user to the entreprise's user list.
 * - Returns a 201 status with the created user data or a 404 status if the entreprise is not found.
 * * - If an error occurs during the process, it logs the error and returns a 500 status with an error message.
 */
const post = async (req, res) => {

    const { firstName, lastName, email } = req.body;
    const role = "user";

    const entreprise = await database().collection('entreprises').findOne({ "uuid": req.user.entreprise.uuid });

    if (!entreprise) {
        return res.status(404).json({ status: 'error', message: 'Entreprise not found' });
    }

    const checkExist = await database().collection('users').findOne({ email: email });
    const user = {
        uuid: require('uuid').v4().replace(/-/g, ''),
        firstName,
        lastName,
        email,
        role,
        active: true,
        reset_token: require('crypto').randomBytes(64).toString('hex'),
        createdAt: new Date(),
        updatedAt: new Date()
    };

    if (!checkExist) {

        await database().collection('users').insertOne(user);
    }

    const mail = new mailCreator();
    mail.setSubject(`You're invited to join ${entreprise.name}`);
    mail.setText(`Hello ${firstName} ${lastName},\n\nYou have been invited to join the entreprise ${entreprise.name}.\nPlease follow the link to complete your registration: https://bizexpenses.hugochilemme.com/set-auth/${user.reset_token}\n\nBest regards,\nThe BizExpenses Team`);
    mail.setRecipients(email);
    mail.send();

    await database().collection('entreprises').updateOne(
        { "uuid": req.user.entreprise.uuid },
        { $push: { users: { id: user.uuid, role: "user" } } }
    );

    return res.status(201).json({ status: 'success', data: user });
};


/** * Deletes a user from the entreprise.
 * @async
 * @function delete
 * @param {import('express').Request} req - Express request object, expects `userId` in query.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the status of the deletion or an error message.
 * @description
 * - Validates the presence of the `userId` query parameter.
 * - Checks if the user exists in the database.
 * - Checks if the user is part of the entreprise associated with the authenticated user.   
 * - If the user is found and part of the entreprise, removes the user from the entreprise's user list.
 * - Returns a 200 status with a success message or a 404 status if the user is not found or not part of the entreprise.
 * * - If an error occurs during the process, it logs the error and returns a 500 status with an error message.
 */
const del = async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    const entrepriseUuid = req.user.entreprise.uuid;

    // Check if the user exists
    const user = await database().collection('users').findOne({ uuid: userId });
    if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check if the user is part of the entreprise
    const entreprise = await database().collection('entreprises').findOne({ uuid: entrepriseUuid });
    if (!entreprise || !entreprise.users.some(u => u.id === userId))
    {
        return res.status(404).json({ status: 'error', message: 'User not part of the entreprise' });
    }   

    // Remove the user from the entreprise
    await database().collection('entreprises').updateOne(
        { uuid: entrepriseUuid },
        { $pull: { users: { id: userId } } }
    );  

    res.status(200).json({ status: 'success', message: 'User deleted successfully' });
};        



const put = async (req, res) => {
    // update role
    const { userId, role } = req.query;

    if (!userId || !role) {
        return res.status(400).json({ status: 'error', message: 'User ID and role are required' });
    }   

    const entrepriseUuid = req.user.entreprise.uuid;
    // Check if the user exists
    const user = await database().collection('users').findOne({ uuid: userId });
    if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check if the user is part of the entreprise
    const entreprise = await database().collection('entreprises').findOne({ uuid: entrepriseUuid });
    if (!entreprise || !entreprise.users.some(u => u.id === userId))
    {
        return res.status(404).json({ status: 'error', message: 'User not part of the entreprise' });
    }   

    // Update the user's role
    await database().collection('entreprises').updateOne(
        { uuid: entrepriseUuid, "users.id": userId },
        { $set: { "users.$.role": role } }  
    );

    res.status(200).json({ status: 'success', message: 'User role updated successfully' });
}

module.exports = { get, post, config, delete: del, put };
