// modules/commands/uid.js
module.exports = {
  name: "uid",
  usePrefix: false,
  description: "Get Facebook user info (works in group or PM)",
  async execute({ api, event, args }) {
    try {
      let targetID;

      // Determine target UID
      if (event.messageReply) {
        targetID = event.messageReply.senderID;
      } else if (args.length > 0) {
        targetID = args[0].replace(/\D/g, ""); // Keep only numbers
      } else {
        targetID = event.senderID;
      }

      // Fetch info (payload = true means faster basic info)
      const info = await api.getUserInfo(targetID, false); // false = use deep profile fetch
      if (!info) {
        return api.sendMessage("⚠️ Could not fetch user info.", event.threadID, event.messageID);
      }

      // Build message
      const lines = [
        `📌 Name: ${info.name || "Unknown"}`,
        `🆔 UID: ${info.id}`,
        `⚧ Gender: ${info.gender || "Unknown"}`,
        `🔗 Profile: ${info.profileUrl || "N/A"}`,
        `🖼 Profile Pic: ${info.profilePicUrl || "N/A"}`,
      ];

      if (info.bio) lines.push(`📝 Bio: ${info.bio}`);
      if (info.live_city) lines.push(`🏙 Lives in: ${info.live_city}`);
      if (info.followers) lines.push(`👥 Followers: ${info.followers}`);
      if (info.following) lines.push(`➡️ Following: ${info.following}`);
      if (info.isVerified) lines.push(`✔ Verified: Yes`);
      if (info.coverPhoto) lines.push(`🖼 Cover Photo: ${info.coverPhoto}`);

      api.sendMessage(lines.join("\n"), event.threadID, event.messageID);

    } catch (err) {
      console.error("UID command error:", err);
      api.sendMessage("❌ An error occurred while fetching user info.", event.threadID, event.messageID);
    }
  }
};
