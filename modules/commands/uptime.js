function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  let str = "";
  if (days > 0) str += `${days}d `;
  if (hours > 0 || days > 0) str += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) str += `${minutes}m `;
  str += `${seconds}s`;

  return str.trim();
}

const botStartTime = Date.now();

module.exports = {
  name: "uptime",
  usePrefix: false,
  usage: "uptime",
  version: "1.0",
  admin: false,
  cooldown: 5,

  execute: async ({ api, event }) => {
    const uptimeMs = Date.now() - botStartTime;
    const uptimeStr = formatDuration(uptimeMs);
    return api.sendMessage(
      `🤖 Bot uptime: ${uptimeStr}`,
      event.threadID,
      event.messageID  
    );
  }
};
