const User = require('../models/user');
const Url = require('../models/url');

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

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

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

// Get user statistics for dashboard
const getUserStats = async (req, res) => {
  try {
    // Exclude admin users from all stats
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ status: 'active', role: { $ne: 'admin' } });
    const suspendedUsers = await User.countDocuments({ status: 'suspended', role: { $ne: 'admin' } });

    res.json({
      registered: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Get all users with pagination and search
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = {};
    
    // Exclude admin users
    query.role = { $ne: 'admin' };
    
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }
    
    if (status) {
      query.status = status;
    }

    const users = await User.find(query, '-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    // Get actual URL counts for each user
    const usersWithExtraData = await Promise.all(
      users.map(async (user) => {
        const urlCount = await Url.countDocuments({ userId: user.userId });
        return {
          ...user.toObject(),
          lastLogin: user.lastLogin ? user.lastLogin.toISOString().split('T')[0] : 'Never',
          sitesCount: urlCount
        };
      })
    );

    res.json({
      users: usersWithExtraData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
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
      user 
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOneAndDelete({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get user by email (for search functionality)
const searchUsers = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const users = await User.find(
      { email: { $regex: email, $options: 'i' } },
      '-password'
    ).limit(10);

    res.json(users);
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get URL counts per user for admin dashboard
const getUserUrlCounts = async (req, res) => {
  try {
    // Get all users
    const users = await User.find({}, 'userId email -_id');
    
    // Get URL counts for each user using aggregation for better performance
    const urlCounts = await Url.aggregate([
      {
        $group: {
          _id: '$userId',
          urlCount: { $sum: 1 }
        }
      }
    ]);

    // Create a map for quick lookup
    const urlCountMap = {};
    urlCounts.forEach(item => {
      urlCountMap[item._id] = item.urlCount;
    });

    // Combine user data with URL counts
    const userUrlCounts = users.map(user => ({
      userId: user.userId,
      email: user.email,
      urlCount: urlCountMap[user.userId] || 0
    }));

    // Sort by URL count descending
    userUrlCounts.sort((a, b) => b.urlCount - a.urlCount);

    res.json(userUrlCounts);
  } catch (err) {
    console.error('Error fetching user URL counts:', err);
    res.status(500).json({ error: 'Failed to fetch user URL counts' });
  }
};

// Get detailed URL information for a specific user
const getUserUrls = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await User.findOne({ userId }, 'email -_id');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all URLs for the user
    const urls = await Url.find({ userId }, '-_id')
      .sort({ createdAt: -1 });

    res.json({
      user: {
        userId,
        email: user.email
      },
      urls,
      totalUrls: urls.length
    });
  } catch (err) {
    console.error('Error fetching user URLs:', err);
    res.status(500).json({ error: 'Failed to fetch user URLs' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminData,
  getUserStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  searchUsers,
  getUserUrlCounts,
  getUserUrls
};
