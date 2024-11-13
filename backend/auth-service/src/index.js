
const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();
const PORT = 3002;

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

app.use(express.json());

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkQuery = 'SELECT * FROM users WHERE email = $1 OR username = $2';
    const checkValues = [email, username];
    const result = await pool.query(checkQuery, checkValues);

    if (result.rows.length > 0) {
      const existingUser = result.rows[0];
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    const insertValues = [username, email, hashedPassword];
    await pool.query(insertQuery, insertValues);

    console.log("User registered successfully");
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during user registration:', err);
    res.status(500).json({ message: 'Error during user registration' });
  }
});



app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
