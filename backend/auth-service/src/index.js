
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
  console.log("Received registration data:", req.body);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    const values = [username, email, hashedPassword];
    await pool.query(query, values);

    console.log("User registered successfully");
    res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
  } catch (err) {
    console.error('error on register :', {
      message: err.message,
      autre : err.status,
      autre : err.status,
      autre : err.values,
      stack: err.stack,
      code: err.code,          // Code erreur SQL, s'il est disponible
      detail: err.detail,      // Détails additionnels spécifiques à PostgreSQL
      table: err.table,        // Nom de la table, si disponible
      constraint: err.constraint, // Contrainte qui a échoué, si disponible
    });
    res.status(500).json({ 
      message: 'error on register ',
      error: err.message       // Optionnel : renvoyer le message d'erreur au client
    });
  }
});



app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
