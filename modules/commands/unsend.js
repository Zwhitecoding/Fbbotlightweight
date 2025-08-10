module.exports = {
  name: "unsent",
  description: "Unsend a message by replying or using a message ID",
  usePrefix: true,
  async execute({ api, event, args }) {
    try {
      let messageID;

      if (args.length > 0) {
        messageID = args[0];
      } else if (event.messageReply && event.messageReply.messageID) {
        messageID = event.messageReply.messageID;
      } else {
        return api.sendMessage(
          "❌ Please reply to a message or provide a message ID.",
          event.threadID,
          event.messageID
        );
      }

      await api.unsent(messageID, event.threadID);
      api.sendMessage(`✅ Successfully unsent message: ${messageID}`, event.threadID);
    } catch (error) {
      api.sendMessage(`❌ Failed to unsent message: ${error.message}`, event.threadID);
    }
  }
};
