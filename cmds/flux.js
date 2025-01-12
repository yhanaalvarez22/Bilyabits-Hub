const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'flux',
    description: 'Generate AI images based on a prompt',
    async execute(api, event, args) {
        const input = args.join(' ').trim();

        const lastSpaceIndex = input.lastIndexOf(' ');
        const prompt = input.substring(0, lastSpaceIndex).trim();
        const model = input.substring(lastSpaceIndex + 1);

        if (!prompt || !model) {
            api.sendMessage(`Please enter a prompt and model.\nUsage: ${config.prefix}flux <describe prompt> -<model>`, event.threadID, event.messageID);
            return;
        }

        api.sendMessage("Generating image...", event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://api.joshweb.click/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`, {
                responseType: 'arraybuffer'
            });

            const imagePath = path.join(__dirname, '..', 'dumps', `image_${Date.now()}.png`);
            fs.writeFileSync(imagePath, response.data);
            const imageStream = fs.createReadStream(imagePath);

            api.sendMessage({
                body: `Image generated for prompt: ${prompt}`,
                attachment: imageStream
            }, event.threadID);
        } catch (error) {
            api.sendMessage("There was an error generating the image. Please try again later.", event.threadID, event.messageID);
        }
    }
};
