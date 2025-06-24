const database = require('../../utils/database');

const config = {
    get: {
        isAuthentified: true,
    },
    post: {
        isAuthentified: true,
        _entreprise_roles: ['owner', 'rh'],
    }
};

const get = async (req, res) => {
    const role = req.user?.entreprise?.role;
    if (role === "owner" || role === "rh") {
        // Fetch all employees
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

    const user = {
        uuid: require('uuid').v4().replace(/-/g, ''),
        firstName,
        lastName,
        email,
        role,
        active: true,
        regisered: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    await database().collection('users').insertOne(user);
    await database().collection('entreprises').updateOne(
        { "uuid": req.user.entreprise.uuid },
        { $push: { users: { id: user.uuid } } }
    );

    return res.status(201).json({ status: 'success', data: user });
};

module.exports = { get, post, config };
