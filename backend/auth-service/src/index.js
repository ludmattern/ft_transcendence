require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cookieParser = require('cookie-parser');
const redis = require('redis');


const app = express();
const PORT = 3002;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

console.log('REDIS_PORT:', REDIS_PORT);
console.log('REDIS_HOST:', REDIS_HOST);
console.log('REDIS_PASSWORD:', REDIS_PASSWORD);

app.use(express.json());
app.use(cookieParser());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'postgres',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

const redisClient = redis.createClient({
	host: REDIS_HOST,
	port: parseInt(REDIS_PORT, 10),
	password: REDIS_PASSWORD
  });
  
redisClient.on('error', (err) => console.error('Redis error:', err));

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
    res.status(500).send('Server err');
  }
});

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
    const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
    const values = [username, email, hashedPassword];
    await pool.query(query, values);
    res.status(201).json({ message: 'User successfully regestered' });
  } catch (err) {
    console.error('Error on register', err);
    res.status(500).json({ message: 'Error on register' });
  }
});

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
  
	try {
	  const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
	  const user = userResult.rows[0];
	  if (!user) return res.status(400).json({ message: 'User not find' });
  
	  const match = await bcrypt.compare(password, user.password);
	  if (!match) return res.status(400).json({ message: 'Wrong password' });
  
	  const accessToken = jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: '15m' });
	  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' });
	  
	  await redisClient.setex(user.id, 60 * 60 * 24 * 7, refreshToken); // Expire after 7 days
  
	  res.cookie('auth_token', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'Lax'
	  });
	  res.status(200).json({ message: 'Success on login' });
	} catch (err) {
	  console.error('err on login :', err);
	  res.status(500).json({ message: 'server error' });
	}
});

app.post('/refresh-token', async (req, res) => {
	const { userId } = req.body;
  
	try {
	  const storedToken = await redisClient.get(userId);
	  if (!storedToken) return res.sendStatus(403);
  
	  const userData = jwt.verify(storedToken, REFRESH_SECRET);
  
	  const remainingTime = jwt.decode(storedToken).exp - Math.floor(Date.now() / 1000);
	  if (remainingTime < 3600) {
		const newRefreshToken = jwt.sign({ id: userData.id }, REFRESH_SECRET, { expiresIn: '7d' });
		await redisClient.setex(userData.id, 60 * 60 * 24 * 7, newRefreshToken);
	  }
  
	  const newAccessToken = jwt.sign({ id: userData.id }, ACCESS_SECRET, { expiresIn: '15m' });
	  res.json({ accessToken: newAccessToken });
	} catch (err) {
	  res.sendStatus(403);
	}
  });

  app.post('/logout', async (req, res) => {
	const token = req.cookies.auth_token; // Récupérer le auth_token depuis les cookies
  
	if (!token) {
	  return res.status(401).json({ message: 'Aucun token trouvé' });
	}
  
	try {
	  const decoded = jwt.verify(token, ACCESS_SECRET);
	  const userId = decoded.id;
  
	  await redisClient.del(userId);
	  res.clearCookie('auth_token');
	  res.json({ message: 'logout successfull' });
	} catch (err) {
	  console.error('error on logout:', err);
	  res.status(500).json({ message: 'error on server' });
	}
  });
  

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
