
const config = {
	post: {
		isAuthentified: true,
	}
}

const post = async (req, res) => {

	return res.send({status: 'success', data: req.user});
};

module.exports = {
	post,
	config
};