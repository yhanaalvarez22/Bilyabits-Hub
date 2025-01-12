const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'flux',
    description: 'Generate an AI image based on a prompt and model selection',
    async execute(api, event, args) {
        // Check if the last argument starts with a hyphen for model selection
        const modelArg = args.pop(); // Get the last argument
        const model = modelArg.startsWith('-') ? modelArg.slice(1) : null; // Remove the hyphen
        
        // Join remaining arguments as the prompt
        const prompt = args.join(' ');

        // Validate prompt and model
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
