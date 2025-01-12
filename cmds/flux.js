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
        if (args.length < 2 || !args.includes('-')) {
            api.sendMessage(`Please provide a prompt and a model.\nUsage: ${config.prefix}flux <prompt> -<model>`, event.threadID);
            return;
        }

        // Extract the prompt and model from the arguments
        const modelIndex = args.indexOf('-');
        const prompt = args.slice(0, modelIndex).join(' ');
        const model = args[modelIndex + 1]; // Get the model parameter

        // Validate the model
        if (!allowedModels.includes(model)) {
            api.sendMessage(`Invalid model specified. Allowed models are: ${allowedModels.join(', ')}`, event.threadID);
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
