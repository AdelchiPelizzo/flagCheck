require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('flags-db');        // Use your DB name here
    const collection = db.collection('flags');

    const sampleData = [
      { orgId: '00D7X000000AAAA', flag_color: 'green' },
      { orgId: '00D7X000000BBBB', flag_color: 'yellow' },
      { orgId: '00D7X000000CCCC', flag_color: 'red' }
    ];

    const result = await collection.insertMany(sampleData);
    console.log(`${result.insertedCount} documents inserted.`);
  } catch (err) {
    console.error('Insert error:', err);
  } finally {
    await client.close();
  }
}

run();
