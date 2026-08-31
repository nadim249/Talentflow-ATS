//Writer: Nadim
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');


const app = express();

app.use(express.json());

// Health check.
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
});