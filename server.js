const express = require('express');
require('dotenv').config(); // Load env vars

const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);

let collection;  // Will hold your flags collection

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db('flags-db');       // Change if your DB name differs
    collection = db.collection('flags');    // Your collection name

  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
}

// Health check route
app.get('/', (req, res) => {
  res.send('Flag API is running!');
});

// Get flag by orgId
app.get('/flag/:orgId', async (req, res) => {
  try {
    const orgId = req.params.orgId;

    if (!collection) {
      return res.status(500).json({ status: 'error', message: 'Database not connected' });
    }

    const flagDoc = await collection.findOne({ orgId });

    if (!flagDoc) {
      return res.status(404).json({ status: 'not found' });
    }

    res.json({ status: 'ok', flag: flagDoc.flag_color });
  } catch (err) {
    console.error('Error fetching flag:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Connect DB, then start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
