const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URL;
const dbName = process.env.MONGODB_DB;

if (!uri) {
	console.error('MONGODB_URL is not set in the environment variables');
	process.exit(1);
}

if (!dbName) {
	console.error('MONGODB_DB is not set in the environment variables');
	process.exit(1);
}

const client = new MongoClient(uri);

let dbInstance = null;

async function connectDB() {
	if (!dbInstance) {
		await client.connect();
		dbInstance = client.db(dbName);
		console.log('Connected to MongoDB');
	}
	return dbInstance;
}

module.exports = connectDB;