const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/user');

// Registration now accepts 'status'
router.post('/register', userController.registerUser);

// Login checks status inside controller
router.post('/login', userController.loginUser);

// Get all users (shows status, hides password)
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

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

// OPTIONAL: Admin can update user status
router.patch('/:id/status', async (req, res) => {
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