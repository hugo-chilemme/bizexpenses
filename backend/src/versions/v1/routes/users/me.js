const config = {
    get: {
        isAuthentified: true,
    }
};

const get = async (req, res) => {
    return res.status(200).json({ status: 'success', data: req.user });
};

module.exports = { get, config };
