const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const verifyJwt = require('../middlewares/verifyJWT');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', verifyJwt, logout);

module.exports = router;
