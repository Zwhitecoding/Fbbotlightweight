const axios = require("axios");

module.exports = {
  name: "shoti",
  usage: "shoti",
  version: "1.1",
  admin: false,
  cooldown: 5,
  usePrefix: false,

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;
    const apiKey = "4ce662a5-d58a-470a-bd98-093b842035c8";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/shoti?apikey=${apiKey}`;

    try {
      const response = await axios.get(apiUrl);
      const videoUrl = response?.data?.shoti?.videoUrl;

      if (!videoUrl) {
        return api.sendMessage("⚠️ Couldn't fetch a Shoti video. Please try again later.", threadID, messageID);
      }

      const videoStream = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream"
      });

      return api.sendMessage(
        {
          body: "🎬 Here's a random Shoti video!\n👤 Author: Marjhun Baylon",
          attachment: videoStream.data
        },
        threadID,
        messageID
      );

    } catch (error) {
      console.error("❌ Shoti Stream Error:", error.message);
      return api.sendMessage("❌ An error occurred while streaming the video.", threadID, messageID);
    }
  }
};
