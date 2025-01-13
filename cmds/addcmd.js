const fs = require('fs');
const axios = require('axios');
const path = require('path');

module.exports = {
    name: 'addcmd',
    description: 'Add a new command from raw text or a URL',
    async execute(api, event, args) {
        const senderID = event.senderID;
        const adminID = '100013036275290'; // Replace with your admin ID

        // Restrict command usage to the admin
        if (senderID !== adminID) {
            return api.sendMessage('You do not have permission to use this command.', event.threadID);
        }

        if (args.length < 2) {
            return api.sendMessage('Usage:\n/addcmd <filename.js> "<command code>"\n/addcmd <filename.js> <URL>', event.threadID);
        }

        const filename = args[0];
        const filePath = path.join(__dirname, filename);

        // Check if the file already exists
        if (fs.existsSync(filePath)) {
            return api.sendMessage(`The command file ${filename} already exists. Please choose a different name.`, event.threadID);
        }

        let code = args.slice(1).join(' ');

        // Determine if the second argument is a URL
        const urlPattern = /^https?:\/\/\S+$/;
        if (urlPattern.test(code)) {
            const url = code;
            try {
                const response = await axios.get(url);
                code = response.data;
            } catch (error) {
                return api.sendMessage('Failed to fetch code from the provided URL.', event.threadID);
            }
        } else {
            // Remove surrounding quotes if present
            code = code.replace(/^"(.*)"$/, '$1');
        }

        // Validate the command code
        if (!code.includes('module.exports')) {
            return api.sendMessage('Invalid command code. Ensure it follows the correct format.', event.threadID);
        }

        // Write the command code to a new file
        try {
            fs.writeFileSync(filePath, code, 'utf8');
            api.sendMessage(`Command ${filename} has been added successfully.`, event.threadID);
        } catch (error) {
            return api.sendMessage('Failed to add the new command.', event.threadID);
        }

        // Dynamically load the new command
        try {
            const newCommand = require(filePath);
            api.commands.set(newCommand.name, newCommand);
            api.sendMessage(`Command ${newCommand.name} is now active.`, event.threadID);
        } catch (error) {
            // Remove the file if loading fails
            fs.unlinkSync(filePath);
            return api.sendMessage('Failed to load the new command. The file has been removed.', event.threadID);
        }
    },
};
