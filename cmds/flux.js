const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'flux',
    description: 'Generate an AI image based on a prompt and model selection',
    async execute(api, event, args) {
        const promptIndex = args.indexOf('-');
        const model = promptIndex !== -1 ? args[promptIndex + 1] : null;
        const prompt = promptIndex !== -1 ? args.slice(0, promptIndex).join(' ') : args.join(' ');

        if (!prompt || !model || isNaN(model) || model < 1 || model > 5) {
            api.sendMessage(`Usage: ${config.prefix}flux <prompt> -<model (1-5)>`, event.threadID);
            return;
        }

        api.sendMessage("Generating your image...", event.threadID);

        try {
            const response = await axios.get(`https://api.joshweb.click/api/flux?prompt=${encodeURIComponent(prompt)}&model=${model}`);
            if (response.data && response.data.imageUrl) {
                api.sendMessage({ body: `Here is your generated image:`, attachment: response.data.imageUrl }, event.threadID);
            } else {
                api.sendMessage("There was an error generating your image. Please try again later.", event.threadID);
            }
        } catch (error) {
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID);
        }
    }
};
