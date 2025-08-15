const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/user');
const checkAdmin = require('../middleware/checkAdmin');

// Public routes
// Registration now accepts 'status'
router.post('/register', userController.registerUser);

// Login checks status inside controller
router.post('/login', userController.loginUser);

// Get user profile (shows status, hides password)
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }, '-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Admin check, status checked in controller
router.post('/admin-data', userController.adminData);

// Admin-only routes (require checkAdmin middleware)
// Get user statistics for dashboard
router.get('/admin/stats', checkAdmin, userController.getUserStats);

// Get all users with pagination and search
router.get('/admin/all', checkAdmin, userController.getAllUsers);

// Search users by email
router.get('/admin/search', checkAdmin, userController.searchUsers);

// Get URL counts per user for admin dashboard
router.get('/admin/url-counts', checkAdmin, userController.getUserUrlCounts);

// Get detailed URL information for a specific user
router.get('/admin/:userId/urls', checkAdmin, userController.getUserUrls);

// Update user status
router.patch('/admin/:userId/status', checkAdmin, userController.updateUserStatus);

// Delete user
router.delete('/admin/:userId', checkAdmin, userController.deleteUser);

// Get all users (shows status, hides password) - keeping for backward compatibility but making it admin-only
router.get('/admin/list', checkAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// OPTIONAL: Admin can update user status (keeping for backward compatibility)
router.patch('/:id/status', checkAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Status updated', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;