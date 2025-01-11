const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: "pinterest",
    description: "Fetch Pinterest URLs based on user prompt and convert them into photo attachments",
    async execute(api, event) {
        const message = event.body.trim();
        const prefix = `${config.prefix}ai`;
        const question = message.slice(prefix.length).trim();
        const time = new Date();
        const timestamp = time.toISOString().replace(/[:.]/g, "-");

        if (!question) {
            api.sendMessage(`Please provide a prompt to search for Pinterest images.\nUsage: pinterest <search prompt>`, event.threadID, event.messageID);
            return;
        }

        const parts = input.split('-').map(part => part.trim());
        const key = parts[0];
        const len = parseInt(parts[1], 10) || 6;

        api.sendMessage(`Searching for "${key}" on Pinterest...`, event.threadID, event.messageID);

        try {
            const response = await axios.get(`https://random-api-pcoe.onrender.com/api/pinterest?search=${encodeURIComponent(key)}`);
            if (response.data && response.data.data) {
                const data = response.data.data;
                const file = [];

                for (let i = 0; i < Math.min(len, data.length); i++) {
                    const path = `./dumps/${timestamp}_pinterest.jpeg`;
                    const download = (await axios.get(data[i], { responseType: 'arraybuffer' })).data;
                    fs.writeFileSync(path, Buffer.from(download));
                    file.push(fs.createReadStream(path));
                }

                await api.sendMessage({ attachment: file, body: "" }, event.threadID, (err) => {
                    if (!err) {
                        file.forEach((_, i) => fs.unlinkSync(`./dumps/${timestamp}_pinterest.jpeg`));
                    } else {
                        console.error("Failed to send message:", err);
                    }
                }, event.messageID);
            } else {
                api.sendMessage("No data returned from API.", event.threadID, event.messageID);
            }
        } catch (error) {
            api.sendMessage(`An error occurred while searching for images: ${error.message}`, event.threadID, event.messageID);
            console.error(error);
        }
    }
};
