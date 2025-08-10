const axios = require("axios");

module.exports = {
  name: "waifu",
  usage: "waifu",
  version: "1.0",
  admin: false,
  cooldown: 5,
  usePrefix: false,

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;
    const apiKey = "4ce662a5-d58a-470a-bd98-093b842035c8";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/waifu?apikey=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      const { imageUrl } = response.data;

      if (!imageUrl) {
        return api.sendMessage("❌ Failed to retrieve waifu image. Try again later.", threadID, messageID);
      }

      const imageStream = await axios.get(imageUrl, {
        responseType: "stream",
      });

      const caption =
        `💗 Here's your waifu!\n━━━━━━━━━━━━━━━━━━\n` +
        `👤 Author: Marjhun Baylon`;

      return api.sendMessage(
        {
          body: caption,
          attachment: imageStream.data,
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("Error fetching waifu:", error);
      return api.sendMessage("❌ An error occurred while fetching the waifu image.", threadID, messageID);
    }
  },
};
