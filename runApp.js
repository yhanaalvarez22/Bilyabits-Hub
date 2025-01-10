const fs = require("fs");
const login = require("chatbox-fca-remake");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;  // Use the PORT environment variable or default to 3000

// Load commands from the cmds folder
const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
console.log("=====COMMANDS LOADED=====");
commandFiles.forEach(file => {
    console.log(`[~] ${file.replace('.js', '')}`);
});

login({
    email: "ronaldcoldman2025@gmail.com",
    password: "Ronald2025coldman"
}, (err, api) => {
    if (err) return console.error(err);  // Handle login errors

    // Set the bot's options for its behavior and connection
    api.setOptions({
        forceLogin: true,  // Force login even if the session is active
        listenEvents: true,  // Enable event listening
        logLevel: "silent",  // Set log level to silent (no logs)
        updatePresence: true,  // Keep the presence (status) updated
        selfListen: false,  // Do not listen to the bot's own messages
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0",  // Set custom user agent for the bot
        online: true,  // Keep the bot offline or Set it to true if you want to see bots online status.
        autoMarkDelivery: true,  // Disable auto marking of delivery status
        autoMarkRead: false  // Disable auto marking of messages as read
    });

    // Start listening for incoming messages and events
    const stopListening = api.listenMqtt((err, event) => {
        if (err) return console.error(err);  // Handle any errors while listening

        // (Remove simple command program)
    });
});

// Define a simple route
app.get("/", (req, res) => {
    res.send("Bot is running");
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
