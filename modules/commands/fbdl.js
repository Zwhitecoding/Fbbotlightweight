const axios = require("axios");

module.exports = {
  name: "fbdl",
  usage: "facebook [video_url]",
  version: "1.0",
  admin: false,
  cooldown: 10,
  usePrefix: false,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const inputUrl = args.join(" ").trim();

    if (!inputUrl || !inputUrl.startsWith("http")) {
      return api.sendMessage("❌ Please provide a valid Facebook video URL.", threadID, messageID);
    }

    const apiKey = "4ce662a5-d58a-470a-bd98-093b842035c8";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl?url=${encodeURIComponent(inputUrl)}&apikey=${apiKey}`;

    try {
      await api.sendMessage("⏳ Downloading Facebook video, please wait...", threadID, messageID);

      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data || !data.videoUrl) {
        return api.sendMessage("❌ Failed to fetch the Facebook video. Try again later.", threadID, messageID);
      }

      const caption =
        `📱 Facebook Video Downloader\n━━━━━━━━━━━━━━━━━━\n` +
        `🎬 Title: ${data.title || "No title"}\n` +
        `👤 Author: Marjhun Baylon\n` +  
        `📺 Quality: ${data.quality || "Unknown"}\n` +
        `🔗 Source: ${inputUrl}\n\n` +
        `📥 Video will be sent below...`;

      const videoStream = await axios.get(data.videoUrl, {
        responseType: "stream",
      });

      return api.sendMessage(
        { body: caption, attachment: videoStream.data },
        threadID,
        messageID
      );

    } catch (error) {
      return api.sendMessage("❌ An error occurred while downloading the Facebook video.", threadID, messageID);
    }
  },
};
