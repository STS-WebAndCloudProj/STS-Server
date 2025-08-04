const User = require('../models/user');

const registerUser = async (req, res) => {
  try {
    const { email, password, role, status } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser){
      return res.status(400).json({ message: 'Email already exists' });
    }

    const userData = { email, password, role };
    if (status) {
      userData.status = status;
    }

    const user = new User(userData); //create a new user instance
    await user.save();
    res.status(201).json({ message: 'User registered successfully', status: user.status });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};


// handle user login
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

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: `Account is ${user.status}. Please contact administrator.` 
      });
    }

    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// שליפת מידע אדמין בלבד
const adminData = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Access denied. Account is not active.' });
    }

    res.json({ message: 'Welcome, admin! Here is your secure data.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user status (admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const { adminEmail } = req.body; // Admin performing the action

    if (!userId || !status) {
      return res.status(400).json({ message: 'User ID and status are required' });
    }

    // Verify admin permissions
    const admin = await User.findOne({ email: adminEmail });
    if (!admin || admin.role !== 'admin' || admin.status !== 'active') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { status },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'User status updated successfully', 
      user: { userId: user.userId, email: user.email, status: user.status } 
    });
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminData,
  updateUserStatus
};
