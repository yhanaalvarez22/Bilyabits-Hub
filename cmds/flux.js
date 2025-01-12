const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Define the allowed models
const allowedModels = ['1', '2', '3', '4', '5'];

module.exports = {
    name: 'flux',
    description: 'Generate an image based on a prompt with a specified model',
    async execute(api, event, args) {
        // Check if the user provided a prompt
        const modelArgIndex = args.indexOf('-');
        const model = modelArgIndex !== -1 ? args[modelArgIndex + 1] : null;

        // Join the prompt arguments
        const prompt = modelArgIndex !== -1 ? args.slice(0, modelArgIndex).join(' ') : args.join(' ');

        // Validate the model
        if (!model || !allowedModels.includes(model)) {
            api.sendMessage(`Invalid model specified. Usage: ${config.prefix}flux <prompt> -<model>\nAllowed models are: ${allowedModels.join(', ')}`, event.threadID);
            return;
        }

        api.sendMessage("Generating your image...", event.threadID);

        try {
            // Call the image generation API
            const response = await axios.get(`https://api.joshweb.click/api/flux?prompt=${encodeURIComponent(prompt)}&model=${encodeURIComponent(model)}`);
            
            // Check if the response is valid
            if (response.data && response.data.image) {
                api.sendMessage({
                    body: "Here is your generated image:",
                    attachment: response.data.image // Assuming the API returns a direct image URL
                }, event.threadID);
            } else {
                api.sendMessage("There was an error generating your image. Please try again later.", event.threadID);
            }
        } catch (error) {
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID);
        }
    }
};
