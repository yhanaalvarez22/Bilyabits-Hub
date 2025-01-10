const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const stream = require('stream');

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
            const response = await axios.get(`https://ajiro.gleeze.com/api/pinterest?text=${encodeURIComponent(prompt)}`);
            console.log('API Response:', response.data); // Log the API response

            if (response.data.status && response.data.result.length > 0) {
                const attachments = await Promise.all(response.data.result.map(async url => {
                    const res = await axios.get(url, { responseType: 'stream' });
                    return {
                        type: 'photo',
                        stream: res.data
                    };
                }));
                api.sendMessage({ attachment: attachments }, event.threadID);
            } else {
                api.sendMessage("No images found for the given prompt.", event.threadID);
            }
        } catch (error) {
            console.error('API Error:', error); // Log any errors
            api.sendMessage("An error occurred while fetching images from Pinterest. Please try again later.", event.threadID);
        }
    }
};