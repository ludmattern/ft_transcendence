const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

app.get('/hello', (req, res) => {
  res.send("Hello from Auth Service");
});

app.get('/users', async (req, res) => {
  try {
	console.log('PostgreSQL User:', process.env.POSTGRES_USER);
	console.log('PostgreSQL Database:', process.env.POSTGRES_DB);
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur du serveur');
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
