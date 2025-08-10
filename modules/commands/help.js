module.exports = {
  name: "help",
  usage: "help",
  version: "1.0",
  admin: false,
  cooldown: 2,
  usePrefix: false,

  execute: async ({ api, event }) => {
    try {
      const { threadID, messageID } = event;
      const commands = Array.from(api.commands.values());

      if (commands.length === 0) {
        return api.sendMessage("❌ No commands loaded.", threadID, messageID);
      }

      let helpMessage = "𝙷𝚎𝚕𝚙 𝙼𝚎𝚗𝚞 📖\n━━━━━━━━━━━━━━━━━━\n";
      helpMessage += `𝚃𝚘𝚝𝚊𝚕 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${commands.length}\n\n`;

      for (const cmd of commands) {
        const name = cmd.name || "Unnamed";
        const usage = cmd.usage || "No usage";
        const version = cmd.version || "?";
        const prefix = cmd.usePrefix === false ? "No Prefix" : "Needs Prefix";

        helpMessage += `• 𝙽𝚊𝚖𝚎: ${name}\n`;
        helpMessage += `  𝚄𝚜𝚊𝚐𝚎: ${usage}\n`;
        helpMessage += `  𝚅𝚎𝚛𝚜𝚒𝚘𝚗: v${version} | ${prefix}\n`;
        helpMessage += `━━━━━━━━━━━━━━━━━━\n`;
      }

      return api.sendMessage(helpMessage.trim(), threadID, messageID);
    } catch (error) {
      console.error("❌ Help command error:", error);
      return api.sendMessage("❌ An error occurred while fetching commands.", event.threadID, event.messageID);
    }
  }
};
