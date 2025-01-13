const fs = require('fs');
const axios = require('axios');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'addcmd',
    description: 'Add a new command dynamically from raw text or a URL',
    async execute(api, event, args) {
        if (args.length < 2) {
            api.sendMessage(`Usage: ${config.prefix}addcmd <filename> <"command text"> or <url>`, event.threadID, event.messageID);
            return;
        }

        const filename = args[0];
        const input = args.slice(1).join(' ');

        // Check if the input is a URL
        if (input.startsWith('http://') || input.startsWith('https://')) {
            try {
                const response = await axios.get(input);
                if (response.status === 200) {
                    // Save the command from the URL
                    fs.writeFileSync(`./cmds/${filename}`, response.data);
                    api.sendMessage(`Command added from URL: ${filename}`, event.threadID, event.messageID);
                } else {
                    api.sendMessage("Failed to fetch the URL. Please try again.", event.threadID, event.messageID);
                }
            } catch (error) {
                console.error("Error fetching URL:", error);
                api.sendMessage("There was an error fetching the URL. Please try again later.", event.threadID, event.messageID);
            }
        } else {
            // Treat the input as raw text
            const commandText = input.replace(/"/g, ''); // Remove quotes if any
            const commandContent = `module.exports = { name: '${filename.replace('.js', '')}', description: 'Dynamically added command', execute(api, event) { api.sendMessage('${commandText}', event.threadID); } };`;
            fs.writeFileSync(`./cmds/${filename}`, commandContent);
            api.sendMessage(`Command added: ${filename}`, event.threadID, event.messageID);
        }
    }
};
