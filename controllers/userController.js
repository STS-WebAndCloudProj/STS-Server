const User = require('../models/user');

// Register a new user
const registerUser = async (req, res) => {
  try {
    const { email, password, role, status } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Accept status if present, otherwise default from model
    const user = new User({ email, password, role, status });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Handle user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check status before allowing login
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: `User status is '${user.status}'. Access denied.` });
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Admin-only data fetch
const adminData = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check status before admin access
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: `User status is '${user.status}'. Admin access denied.` });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    res.json({ message: 'Welcome, admin! Here is your secure data.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = {
  registerUser,
  loginUser,
  adminData
};
