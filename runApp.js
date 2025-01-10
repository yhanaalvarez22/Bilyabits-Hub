const fs = require("fs");
const login = require("chatbox-fca-remake");

// Simple bot that responds when you say "test" or "/stop"
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

        // Switch case to handle different types of events
        switch (event.type) {
            case "message":
                if (event.body === '/stop') {  // If the message is "/stop"
                    api.sendMessage("Goodbye…", event.threadID);  // Send "Goodbye" message
                    return stopListening();  // Stop listening to events
                }
                if (event.body.toLowerCase() === 'test') {  // If the message is "test" (case-insensitive)
                    api.sendMessage("TEST BOT: " + event.body, event.threadID);  // Send a test response
                }
                break;
            case "event":
                console.log(event);  // Log any other event type
                break;
        }
    });
});
