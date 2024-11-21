const express = require('express');
const router = express.Router();
const Post = require('../models/post');

router.get('/', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.render('home', { posts });
});

module.exports = router;
