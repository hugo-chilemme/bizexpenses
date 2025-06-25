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
    }
};

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

module.exports = { get, post, config, delete: del };
