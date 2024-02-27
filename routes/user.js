const express = require('express');
const { authenticate, refreshAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: `Werlcome ${req.user.username}`,
  });
});

router.get('/profile-refresh', refreshAuth, (req, res) => {
  res.json({
    loggedUser: req.user.username,
  });
});

module.exports = router;
