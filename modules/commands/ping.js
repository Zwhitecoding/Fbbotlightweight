module.exports = {
  name: "ping",
  description: "Replies with pong to test the bot.",
  async execute({ api, event, args }) {
    if (typeof api.sendMessageMqtt === "function") {
      await api.sendMessageMqtt("pong", event.threadID, event.messageID);
    } else if (typeof api.sendMessage === "function") {
      await api.sendMessage("pong", event.threadID, event.messageID);
    } else {
      console.error("No sendMessage function available on api.");
    }
  }
};
