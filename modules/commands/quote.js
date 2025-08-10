const axios = require("axios");

module.exports = {
  name: "quote",
  usage: "quote",
  version: "1.0",
  admin: false,
  cooldown: 8,
  usePrefix: false,

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;

    try {
      const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
      const quotes = response.data;

      if (!quotes || quotes.length === 0) {
        return api.sendMessage("❌ No quotes found.", threadID, messageID);
      }

      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex];

      const quote = `"${randomQuote.quoteText}"\n\n— ${randomQuote.quoteAuthor || "Unknown"}`;

      return api.sendMessage(quote, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
