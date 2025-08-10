const axios = require("axios");

module.exports = {
  name: "ask",
  usePrefix: false,
  async execute({ api, event, args }) {
    try {
      const uid = event.senderID;
      let query = args.join(" ");
      let imageUrl = "";

      if (event.messageReply && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "photo") {
          imageUrl = attachment.url;
          if (!query) query = "What is on this photo";
        }
      }

      if (!query && !imageUrl) {
        return api.sendMessage("Please provide a question or reply to a photo with your question.", event.threadID, event.messageID);
      }

      const url = `https://kaiz-apis.gleeze.com/api/gemini-flash-2.0?q=${encodeURIComponent(query)}&uid=${uid}&imageUrl=${encodeURIComponent(imageUrl)}&apikey=4ce662a5-d58a-470a-bd98-093b842035c8`;

      const response = await axios.get(url);
      const data = response.data;

      if (data && data.response) {
        api.sendMessage(data.response, event.threadID, event.messageID);
      } else {
        api.sendMessage("No valid response from API.", event.threadID, event.messageID);
      }
    } catch (err) {
      api.sendMessage("Error: " + err.message, event.threadID, event.messageID);
    }
  }
};
