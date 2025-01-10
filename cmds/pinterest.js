const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: "pinterest",
    description: "Fetch Pinterest URLs based on user prompt and convert them into photo attachments",
    async execute(api, event) {
        const message = event.body.trim();
        const prefix = `${config.prefix}pinterest`;
        const prompt = message.slice(prefix.length).trim();

        if (!prompt) {
            api.sendMessage(`Please provide a prompt to search for Pinterest images.\nUsage: ${config.prefix}pinterest <search prompt>`, event.threadID, event.messageID);
            return;
        }

        api.sendMessage("Fetching images from Pinterest, please wait...", event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://api.joshweb.click/api/pinterest?q=${encodeURIComponent(prompt)}`);
            if (response.data.status === 200 && response.data.result.length > 0) {
                const attachments = response.data.result.map(url => ({
                    type: "photo",
                    url
                }));
                api.sendMessage({ attachment: attachments }, event.threadID, event.messageID);
            } else {
                api.sendMessage("No images found for the given prompt.", event.threadID, event.messageID);
            }
        } catch (error) {
            api.sendMessage("An error occurred while fetching images from Pinterest. Please try again later.", threadID, messageID);
        }
    }
};
