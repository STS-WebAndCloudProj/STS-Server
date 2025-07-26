const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/user'); // הוספה חשובה!

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// כל המשתמשים ללא סיסמא
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// שליפת פרופיל משתמש לפי שם משתמש
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


// בדיקת גישה של אדמין
router.post('/admin-data', async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        res.json({ message: 'Welcome, admin! Here is your secure data.' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
