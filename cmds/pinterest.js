const axios = require('axios');

module.exports = {
    name: "pinterest",
    description: "Fetch Pinterest URLs based on user prompt and convert them into photo attachments",
    async execute(api, event, args = []) {
        const { threadID, messageID } = event;
        const prompt = args.join(" ").trim();

        if (!prompt) {
            return api.sendMessage("Please provide a prompt to search for Pinterest images.\nUsage: {prefix}pinterest <search prompt>", threadID, messageID);
        }

        api.sendMessage("Fetching images from Pinterest, please wait...", threadID, messageID);

        try {
            const response = await axios.get(`https://ajiro.gleeze.com/api/pinterest?text=${encodeURIComponent(prompt)}`);
            if (response.data.status && response.data.result.length > 0) {
                const attachments = response.data.result.map(url => ({
                    type: "photo",
                    url
                }));
                api.sendMessage({ attachment: attachments }, threadID);
            } else {
                api.sendMessage("No images found for the given prompt.", threadID, messageID);
            }
        } catch (error) {
            api.sendMessage("An error occurred while fetching images from Pinterest. Please try again later.", threadID, messageID);
        }
    }
};
