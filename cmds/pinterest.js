const axios = require('axios');
const fs = require('fs');
const path = require('path');
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
            const response = await axios.get(`https://ajiro.gleeze.com/api/pinterest?text=${encodeURIComponent(prompt)}`);
            if (response.data.status && response.data.result.length > 0) {
                const dumpDir = './dump';
                if (!fs.existsSync(dumpDir)) {
                    fs.mkdirSync(dumpDir);
                }

                const attachments = await Promise.all(response.data.result.map(async (url, index) => {
                    const imagePath = path.join(dumpDir, `pinterest${index}.jpeg`);
                    const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(imagePath, imageResponse.data);
                    return fs.createReadStream(imagePath);
                }));

                api.sendMessage({ attachment: attachments }, event.threadID, event.messageID);

                // Clean up the dump directory
                attachments.forEach((_, index) => fs.unlinkSync(path.join(dumpDir, `pinterest${index}.jpeg`)));
            } else {
                api.sendMessage("No images found for the given prompt.", event.threadID, event.messageID);
            }
        } catch (error) {
            api.sendMessage("An error occurred while fetching images from Pinterest. Please try again later. \n Error: \n" + error, event.threadID, event.messageID);
            console.error(error);
        }
    }
};
