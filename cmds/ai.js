const axios = require('axios');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

module.exports = {
    name: 'ai',
    description: 'Ask an AI question',
    async execute(api, event) {
        const message = event.body.trim();
        const prefix = `${config.prefix}ai`;
        const question = message.slice(prefix.length).trim();

        if (!question) {
            api.sendMessage(`Please enter a question.\nUsage: ${config.prefix}ai <your question>`, event.threadID);
            return;
        }

        api.sendMessage("Processing your question...", event.threadID);

        try {
            const response = await axios.get(`https://ajiro.gleeze.com/api/ai?model=grok-2&system=You are a LLM called groq invented by elon musk&question=${encodeURIComponent(question)}`);
            if (response.data.success) {
                api.sendMessage(response.data.response, event.threadID);
            } else {
                api.sendMessage("There was an error processing your request. Please try again later.", event.threadID);
            }
        } catch (error) {
            api.sendMessage("There was an error processing your request. Please try again later.", event.threadID);
        }
    }
};
