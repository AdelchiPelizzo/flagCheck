const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load env vars

const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;
app.use(cors());
app.use(express.json());


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
  try {
    if (!collection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const flags = await collection.find().toArray();

    const normalized = flags.map(doc => ({
      id: doc._id.toString(),           // convert ObjectId to string for LWC key
      orgId: doc.orgId || '',
      appName: doc.appName || '',       // fallback empty string if missing
      flagColor: doc.flag_color || ''   // normalize snake_case to camelCase
    }));

    res.json(normalized);
  } catch (error) {
    console.error('Error fetching flags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
}); // flagsData is your array or object with flag info

app.put('/flag/:id', async (req, res) => {
  const id = req.params.id;
  const { flagColor } = req.body;

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { flag_color: flagColor, timestamp: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    res.json({ success: true, updated: result.modifiedCount });
  } catch (error) {
    console.error('Error updating flag:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Connect DB, then start server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
