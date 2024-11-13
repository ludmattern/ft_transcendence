const jwt = require('jsonwebtoken');
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  password: process.env.REDIS_PASSWORD,
});

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

async function checkToken(req, res, next) {
  const accessToken = req.cookies.auth_token;
  const refreshToken = req.cookies.refresh_token;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, ACCESS_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.log('Access token expired or invalid');
    }
  }

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
      const userId = decoded.id;
      const storedRefreshToken = await redisClient.get(userId);

      if (storedRefreshToken !== refreshToken) {
        return res.status(403).json({ message: 'Invalid session, please log in again' });
      }

      const newAccessToken = jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: '15m' });
      res.cookie('auth_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });

      req.user = { id: userId };
      return next();
    } catch (err) {
      return res.status(403).json({ message: 'Session expired, please log in again' });
    }
  }

  return res.status(401).json({ message: 'Unauthorized access, please log in' });
}

module.exports = checkToken;
