import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);

(async () => {
    await client.connect();
    console.log('Database is running on port');
})();

const init = (): Db => client.db('hugochilemme');

export default init;