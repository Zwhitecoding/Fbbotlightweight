const axios = require("axios");

module.exports = {
  name: "joke",
  usage: "joke",
  version: "1.0",
  admin: false,
  cooldown: 8,
  usePrefix: false,

  execute: async ({ api, event }) => {
    const { threadID, messageID } = event;
    try {
      const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
      const joke = `${response.data.setup} - ${response.data.punchline}`;
      return api.sendMessage(joke, threadID, messageID);
    } catch (error) {
      return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
    }
  }
};
