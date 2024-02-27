const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJwt = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  jwt.verify(token, process.env.SECRET_KEY, (err) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  });
};

module.exports = verifyJwt;
