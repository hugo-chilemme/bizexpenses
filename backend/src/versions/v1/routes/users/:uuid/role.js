const database = require('../../utils/database');

const ALLOWED_ROLES = ['admin', 'manager', 'employee'];

const config = {
    put: {
        isAuthentified: true,
        roles: ['admin', 'manager']
    }
};

const put = async (req, res) => {
    const { uuid } = req.params;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({ status: 'error', error: 'Invalid role' });
    }

    const result = await database().collection('users').updateOne({ uuid }, { $set: { role } });
    if (!result.matchedCount) {
        return res.status(404).json({ status: 'error', error: 'User not found' });
    }
    return res.json({ status: 'success', message: 'Role updated' });
};

module.exports = { put, config };
