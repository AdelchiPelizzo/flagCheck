const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load env vars

const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;
app.use(cors());

const client = new MongoClient(uri);

let collection;  // Will hold your flags collection

async function connectDB() {
  try {
    await client.connect();
    const db = client.db('flags-db');
    collection = db.collection('flags');
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('DB connection error:', err);
    process.exit(1);
  }
}

// Health check route
app.get('/flag', async (req, res) => {
  if (!collection) {
    return res.status(500).json({ error: 'Database not connected' });
  }
  const flags = await collection.find().toArray();
  res.json(flags);
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
