const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const http = require('http');
const index = express();
const server = http.createServer(index); // Move this after express is initialized
const { Server } = require('socket.io');
const io = new Server(server);
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Test');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

index.use(bodyParser.urlencoded({ extended: true }));
index.set('view engine', 'ejs');

// Set up session middleware
index.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to make user data available in all views
index.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

// Define a root route
index.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.redirect('/login');
    }
});

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const homeRoutes = require('./routes/home');
const messageRoutes = require('./routes/messages');

index.use(express.json());
index.use('/', authRoutes);
index.use('/posts', postRoutes);
index.use('/home', isAuthenticated, homeRoutes);  // Protect the home route
index.use('/uploads', express.static('uploads'));
index.use('/messages', messageRoutes);

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
