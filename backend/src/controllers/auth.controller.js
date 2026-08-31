const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


// Function to sign a JWT token
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// Register a new user
//POST /api/auth/register

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400)
      .json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409)
        .json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password });

    const token = signToken(user._id);

    res.status(201).json({ token, user });

  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

// Login an existing user
//POST /api/auth/login
// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400)
      .json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(401)
        .json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(password);

    if (!ok) return res.status(401)
        .json({ message: 'Invalid credentials' });

    const token = signToken(user._id);

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

// GET /api/auth/me (protected)
async function me(req, res) {
  res.json(req.user);
}

module.exports = {
  register,
  login,
  me,
};