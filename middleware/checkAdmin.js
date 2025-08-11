const User = require('../models/user');

const checkAdmin = async (req, res, next) => {
  try {
    // Get userId from request body, params, or headers
    const userId = req.body.userId || req.params.userId || req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find user by userId (assuming you have a userId field in your User model)
    const user = await User.findOne({ userId }); // or User.findById(userId) if using MongoDB _id
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is active
    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: `User status is '${user.status}'. Admin access denied.` });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Add user to request object for use in next middleware/controller
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ error: 'Internal server error during admin verification' });
  }
};

module.exports = checkAdmin;