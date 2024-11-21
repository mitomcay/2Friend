const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10 MB max file size
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).array('files', 5);

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and videos only!');
  }
}

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Apply middleware to all routes
router.use(isAuthenticated);

// Get all posts
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  const user = await User.findById(req.session.user._id).populate('bookmarks');

  console.log('User bookmarks on load:', user.bookmarks); // Log for debugging

  res.render('home', { posts, user });
});


// Create a post
router.post('/create', upload, async (req, res) => {
  const { content } = req.body;
  const author = req.session.user.username;
  const images = [];
  let video = null;

  req.files.forEach(file => {
    if (file.mimetype.startsWith('image/')) {
      images.push(file.filename);
    } else if (file.mimetype.startsWith('video/')) {
      video = file.filename;
    }
  });

  const post = new Post({ author, content, images, video });
  await post.save();
  res.redirect('/posts');
});

// Upvote a post
router.post('/:id/upvote', async (req, res) => {
  const post = await Post.findById(req.params.id);
  const userId = req.session.user._id;

  if (post) {
    if (post.upvoters.includes(userId)) {
      post.upvotes -= 1;
      post.upvoters = post.upvoters.filter(id => id !== userId);
    } else {
      post.upvotes += 1;
      post.upvoters.push(userId);
      if (post.downvoters.includes(userId)) {
        post.downvotes -= 1;
        post.downvoters = post.downvoters.filter(id => id !== userId);
      }
    }
    await post.save();
    res.json({ upvote: post.upvotes, downvote: post.downvotes });
  } else {
    res.status(404).send('Post not found.');
  }
});

// Downvote a post
router.post('/:id/downvote', async (req, res) => {
  const post = await Post.findById(req.params.id);
  const userId = req.session.user._id;

  if (post) {
    if (post.downvoters.includes(userId)) {
      post.downvotes -= 1;
      post.downvoters = post.downvoters.filter(id => id !== userId);
    } else {
      post.downvotes += 1;
      post.downvoters.push(userId);
      if (post.upvoters.includes(userId)) {
        post.upvotes -= 1;
        post.upvoters = post.upvoters.filter(id => id !== userId);
      }
    }
    await post.save();
    res.json({ upvote: post.upvotes, downvote: post.downvotes });
  } else {
    res.status(404).send('Post not found.');
  }
});

// Delete a post
router.delete('/:id/delete', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post && post.author === req.session.user.username) {
    await Post.deleteOne({ _id: post._id });
    res.status(200).send('Post deleted');
  } else {
    res.status(403).send('Forbidden');
  }
});

// View post with comments
router.get('/:id/comments', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('comments');
  if (post) {
    res.render('post', { post });
  } else {
    res.status(404).send('Post not found.');
  }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    const { content } = req.body;
    const author = req.session.user.username;
    post.comments.push({ author, content });
    await post.save();
    res.redirect(`/posts/${post._id}/comments`);
  } else {
    res.status(404).send('Post not found.');
  }
});

// Bookmark a post
router.post('/:id/bookmark', async (req, res) => {
  const userId = req.session.user._id;
  const postId = req.params.id;
  const user = await User.findById(userId);

  if (user.bookmarks.includes(postId)) {
    // Post is already bookmarked, so remove it
    user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId);
  } else {
    // Post is not bookmarked, so add it
    user.bookmarks.push(postId);
  }

  await user.save();
  res.json({ bookmarks: user.bookmarks.map(id => id.toString()) }); // Consistent response as strings
});

// Get all bookmarks
router.get('/bookmarks', async (req, res) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId).populate('bookmarks');
  res.render('bookmarks', { bookmarks: user.bookmarks });
});

module.exports = router;
