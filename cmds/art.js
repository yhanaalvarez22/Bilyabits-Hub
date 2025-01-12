// art.js
const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'art',
    description: 'Generate an image based on a prompt',
    async execute(api, event, args) {
        const prompt = args.join(' ');

        if (!prompt) {
            api.sendMessage(`Please provide a prompt for the image.\nUsage: ${config.prefix}art <your prompt>`, event.threadID);
            return;
        }

        api.sendMessage("Generating your image, please wait...", event.threadID);

        try {
            const response = await axios.get(`https://api.joshweb.click/api/art?prompt=${encodeURIComponent(prompt)}`);
            const imageUrl = response.data; // Assuming the API returns the image URL directly

            // Send the image back to the user
            api.sendMessage({
                body: "Here is your generated image:",
                attachment: imageUrl // Send the image as an attachment
            }, event.threadID);
        } catch (error) {
            console.error("Error fetching the image:", error);
            api.sendMessage("There was an error generating your image. Please try again later.", event.threadID);
        }
    }
};
