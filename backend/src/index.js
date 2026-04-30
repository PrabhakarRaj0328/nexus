require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./config/database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const start = async () => {
  await initDB();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start().catch(console.error);
