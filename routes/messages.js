const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Chat = require('../models/chat');

// Initialize chat
router.post('/start-chat', async (req, res) => {
    const { usernames } = req.body;
    const userArray = usernames.split(',').map(username => username.trim());
    const users = await User.find({ username: { $in: userArray } });

    if (users.length !== userArray.length) {
        return res.status(404).send('One or more users not found.');
    }

    const chat = await createOrFetchChat(users);
    res.status(200).send({ chatId: chat._id });
});

async function createOrFetchChat(users) {
    // Check if chat already exists for these users
    const chat = await Chat.findOne({ users: { $all: users.map(user => user._id) } });

    if (chat) {
        return chat;
    } else {
        // Create a new chat
        const newChat = new Chat({ users: users.map(user => user._id), messages: [] });
        await newChat.save();
        return newChat;
    }
}

// Send a message
router.post('/send-message', async (req, res) => {
    const { message, chatId } = req.body;
    const chat = await Chat.findById(chatId);

    if (chat) {
        // Prevent messaging oneself
        if (chat.users.includes(req.session.user._id)) {
            return res.status(400).send('You cannot message yourself.');
        }

        chat.messages.push({ 
            sender: req.session.user._id, 
            content: message, 
            timestamp: new Date() 
        });
        await chat.save();
        res.status(200).send('Message sent');
    } else {
        res.status(404).send('Chat not found.');
    }
});


module.exports = router;
