const config = {
	get: {

	}
}


const get = (req, res) => {
	res.status(200).json({
		status: 'success',
		items: [{
			id: "1234567890abcdef12345678",
			label: "Hotel Paris Rive Gauche",
			amount: 150.00,
			products: [
				{
					label: "Chambre double",
					amount: 150.00,
				}
			],
			date: "2023-10-01",
			createdAt: "2023-10-01T12:00:00Z",
			updatedAt: "2023-10-01T12:00:00Z",
		}]
	});
}

module.exports = {
	get,
	config
};