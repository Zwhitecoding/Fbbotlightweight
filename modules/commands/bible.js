const axios = require("axios");

module.exports = {
  name: "bible",
  usage: "bible",
  version: "1.0",
  admin: false,
  cooldown: 8,
  usePrefix: false,

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;

    try {
      const response = await axios.get("https://kaiz-apis.gleeze.com/api/bible?apikey=4ce662a5-d58a-470a-bd98-093b842035c8");
      const data = response.data;

      if (!data || !data.verse || data.verse.length === 0) {
        return api.sendMessage("❌ No verse found. Please try again.", threadID, messageID);
      }

      const verse = data.verse[0];

      const formatted = 
        `📖 𝗥𝗮𝗻𝗱𝗼𝗺 𝗕𝗶𝗯𝗹𝗲 𝗩𝗲𝗿𝘀𝗲\n━━━━━━━━━━━━━━━━━━\n` +
        `📌 𝗥𝗲𝗳𝗲𝗿𝗲𝗻𝗰𝗲: ${data.reference || `${verse.book_name} ${verse.chapter}:${verse.verse}`}\n\n` +
        `🕊️ ${verse.text.trim()}\n\n` +
        `✍️ 𝗦𝗼𝘂𝗿𝗰𝗲: Marjhun Baylon`;

      return api.sendMessage(formatted, threadID, messageID);
    } catch (error) {
      console.error("Bible API error:", error);
      return api.sendMessage("❌ An error occurred while fetching the verse.", threadID, messageID);
    }
  }
};
