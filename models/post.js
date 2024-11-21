const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: String,
  content: String,
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  comments: [{ author: String, content: String }],
  reposts: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  images: [String], // Array of image file names
  video: String, // Video file name
  createdAt: { type: Date, default: Date.now },
  upvoters: [String], // Store user IDs who upvoted
  downvoters: [String] // Store user IDs who downvoted
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
