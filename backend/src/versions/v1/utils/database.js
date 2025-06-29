const { MongoClient } = require('mongodb');

if (!process.env.MONGODB_URL) {
	console.error('MONGODB_URL is not set in the environment variables');
	process.exit(1);
}

if (!process.env.MONGODB_DB) {
	console.error('MONGODB_DB is not set in the environment variables');
	process.exit(1);
}

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri);

(async () => {
	await client.connect();
	console.log('Database is running on port');
})();


const init = () => client.db(process.env.MONGODB_DB);

module.exports = init;