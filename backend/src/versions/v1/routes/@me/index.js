
const config = {
	get: {
		isAuthentified: true,
	}
}

const get = async (req, res) => {

	return res.send({status: 'success', data: req.user});
};

module.exports = {
	get,
	config
};