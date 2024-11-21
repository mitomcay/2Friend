const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure the path is correct

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.send('Username already taken. Please choose another.');
    }
    // Create and save a new user
    const user = new User({ username, password });
    await user.save();
    res.send('Sign up successful. You can now <a href="/login">log in</a>.');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        req.session.user = user; // Set session user
        res.redirect('/home');
    } else {
        res.send('Login failed. Invalid username or password.');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out.');
        }
        res.redirect('/login');
    });
});

// Get profile page
router.get('/profile', (req, res) => {
    res.render('profile', { user: req.session.user });
  });
  
// Update username
router.post('/profile', async (req, res) => {
const user = await User.findById(req.session.user._id);
if (user) {
    user.username = req.body.username;
    await user.save();
    req.session.user.username = user.username; // Update session username
    res.redirect('/profile');
} else {
    res.status(404).send('User not found.');
}
});
  
// Inbox
router.get('/inbox', (req, res) => {
    res.render('inbox', { user: req.session.user });
});

// Initialize chat
router.post('/start-chat', async (req, res) => {
    const { usernames } = req.body;
    const userArray = usernames.split(',').map(username => username.trim());
    // Logic to create or fetch chat
    res.status(200).send('Chat initialized');
});

// Send a message
router.post('/send-message', async (req, res) => {
    const { message, chatId } = req.body;
    // Logic to send message to chat
    res.status(200).send('Message sent');
});

module.exports = router;
