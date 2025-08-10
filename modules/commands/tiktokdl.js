const axios = require("axios");

module.exports = {
  name: "tiktokdl",
  usage: "tiktok [video_url]",
  version: "1.0",
  admin: false,
  cooldown: 10,
  usePrefix: false,

  execute: async ({ api, event, args }) => {
    const { threadID, messageID } = event;

    const inputUrl = args.join(" ").trim();
    if (!inputUrl || !inputUrl.startsWith("http")) {
      return api.sendMessage("❌ Please provide a valid TikTok video URL.", threadID, messageID);
    }

    const apiKey = "4ce662a5-d58a-470a-bd98-093b842035c8";
    const apiUrl = `https://kaiz-apis.gleeze.com/api/tiktok-dl?url=${encodeURIComponent(inputUrl)}&apikey=${apiKey}`;

    try {
      api.sendMessage("⏳ Downloading video, please wait...", threadID, messageID);

      const res = await axios.get(apiUrl);
      const data = res.data;

      if (!data || !data.url) {
        return api.sendMessage("❌ Failed to fetch the TikTok video. Try again later.", threadID, messageID);
      }

      const caption =
        `🎵 𝗧𝗶𝗸𝗧𝗼𝗸 𝗩𝗶𝗱𝗲𝗼 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n━━━━━━━━━━━━━━━━━━\n` +
        `📌 𝗧𝗶𝘁𝗹𝗲: ${data.title || "No title"}\n` +
        `🎥 𝗧𝘆𝗽𝗲: ${data.type || "video"}\n` +
        `👤 𝗔𝘂𝘁𝗵𝗼𝗿: Marjhun Baylon\n\n` +
        `🔗 𝗦𝗼𝘂𝗿𝗰𝗲: ${inputUrl}\n` +
        `📥 𝗩𝗶𝗱𝗲𝗼 𝘄𝗶𝗹𝗹 𝗯𝗲 𝘀𝗲𝗻𝘁 𝗯𝗲𝗹𝗼𝘄...`;

      const videoStream = await axios.get(data.url, {
        responseType: "stream",
      });

      return api.sendMessage(
        { body: caption, attachment: videoStream.data },
        threadID,
        messageID
      );
    } catch (error) {
      return api.sendMessage("❌ An error occurred while downloading the video.", threadID, messageID);
    }
  },
};
