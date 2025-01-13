const fs = require('fs');
const axios = require('axios');

module.exports = {
    name: 'addcmd',
    description: 'Adds a new command from raw text or URL',
    execute(api, event, args) {
        const commandName = args[0];
        const commandContent = args.slice(1).join(' ');

        if (!commandName || !commandContent) {
            return api.sendMessage('Usage: /addcmd <commandName> <commandContent or URL>', event.threadID);
        }

        if (commandContent.startsWith('http') || commandContent.startsWith('https')) {
            // Handle URL-based command
            axios.get(commandContent)
                .then(response => {
                    const commandCode = response.data;
                    saveCommand(commandName, commandCode, api, event);
                })
                .catch(error => {
                    console.error('Error fetching the command from URL:', error);
                    api.sendMessage('Failed to fetch the command from the provided URL.', event.threadID);
                });
        } else {
            // Handle raw text-based command
            saveCommand(commandName, commandContent, api, event);
        }
    }
};

function saveCommand(commandName, commandCode, api, event) {
    const commandPath = `./cmds/${commandName}.js`;

    fs.writeFile(commandPath, commandCode, (err) => {
        if (err) {
            console.error('Error saving the command:', err);
            api.sendMessage('Failed to save the new command.', event.threadID);
        } else {
            api.sendMessage(`Command ${commandName} added successfully!`, event.threadID);
            console.log(`Command ${commandName} added successfully!`);
        }
    });
}
