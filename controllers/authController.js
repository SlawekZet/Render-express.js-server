const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const expressSesion = require('express-session');

// Register a new user
const register = async (req, res, next) => {
  const { username, email, password, accessToken } = req.body;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const usernameRegex = /^[a-zA-Z0-9_-]{5,20}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,20}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  } else if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: 'Invalid username' });
  } else if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  const userCheck = await User.findOne({ username });
  if (userCheck) {
    return res.status(400).json({ message: `User ${username} already exists` });
  }
  const emailCheck = await User.findOne({ email });
  if (emailCheck) {
    return res
      .status(400)
      .json({ message: `Email ${email} has been already used` });
  }

  try {
    const user = new User({ username, email, password, accessToken });
    await user.save();
    res.json({ message: 'Registration complete' });
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: 'Username and password are required' });

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect Password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '1d',
    });

    user.accessToken = token;
    const result = await user.save();
    console.log(result);

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(400); // no content
  const token = cookies.jwt;
  console.log(token);

  const foundUser = await User.findOne({ accessToken: token }).exec();
  if (!foundUser) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });
    return res.sendStatus(204);
  }

  foundUser.accessToken = '';
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
  return res.sendStatus(204);
};

module.exports = { register, login, logout };
