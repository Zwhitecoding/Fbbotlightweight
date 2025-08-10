const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const gradient = require("gradient-string");
const express = require("express");
const { login } = require("ws3-fca");

const LOG_FILE = path.join(__dirname, "bot.log");
const PUBLIC_DIR = path.join(__dirname, "public");

function appendLog(message) {
  fs.appendFileSync(LOG_FILE, message + "\n", "utf8");
}

function logVIP(message) {
  const timestamp = new Date().toISOString();
  const line = `✨ [${timestamp}] ${message}`;
  console.log(line);
  appendLog(line);
}

function logError(message, err) {
  const timestamp = new Date().toISOString();
  const line = `❌ [${timestamp}] ${message} ${err || ""}`;
  console.error(line);
  appendLog(line);
}

function hookHttpRequests() {
  const originalHttpRequest = http.request;
  http.request = function (...args) {
    const options = args[0];
    const url = typeof options === "string" ? options : (options?.hostname || options?.host) + (options?.path || "");
    logVIP(`HTTP Request: ${url}`);
    return originalHttpRequest.apply(this, args);
  };
  const originalHttpsRequest = https.request;
  https.request = function (...args) {
    const options = args[0];
    const url = typeof options === "string" ? options : (options?.hostname || options?.host) + (options?.path || "");
    logVIP(`HTTPS Request: ${url}`);
    return originalHttpsRequest.apply(this, args);
  };
}

hookHttpRequests();

const app = express();
app.use(express.static(PUBLIC_DIR));
app.get("/logs", (req, res) => {
  if (!fs.existsSync(LOG_FILE)) return res.send("No logs yet...");
  res.send(fs.readFileSync(LOG_FILE, "utf8"));
});
app.listen(3000, () => {
  logVIP("🌐 Log viewer running at http://localhost:3000/logs.html");
});

let credentials;
try {
  credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };
} catch (err) {
  logError("appstate.json is missing or malformed.", err);
  process.exit(1);
}

const groupsFile = path.join(__dirname, "groups.json");
if (!fs.existsSync(groupsFile)) fs.writeFileSync(groupsFile, "[]");

function readGroups() {
  try {
    const raw = fs.readFileSync(groupsFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveGroups(groups) {
  fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
}

logVIP("🚀 Starting login process...");

login(
  credentials,
  {
    online: true,
    updatePresence: true,
    selfListen: false,
    randomUserAgent: false,
  },
  async (err, api) => {
    if (err) {
      logError("LOGIN ERROR:", err);
      return;
    }

    logVIP(`✅ Successfully logged in as UserID: ${api.getCurrentUserID()}`);

    const commandsDir = path.join(__dirname, "modules", "commands");
    api.commands = new Map();

    if (!fs.existsSync(commandsDir)) fs.mkdirSync(commandsDir, { recursive: true });

    const commandFiles = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".js"));
    logVIP(`🔧 Loading ${commandFiles.length} command(s) from: ${commandsDir}`);

    for (const file of commandFiles) {
      try {
        const command = require(path.join(commandsDir, file));
        if (command.name && typeof command.execute === "function") {
          api.commands.set(command.name, command);
          logVIP(`✨ Loaded command: ${command.name}`);
        } else {
          logVIP(`⚠️ Skipped invalid command file: ${file}`);
        }
      } catch (e) {
        logError(`Failed to load command file: ${file}`, e);
      }
    }

    const prefix = "/";

    api.listenMqtt(async (err, event) => {
      if ((!event.body && !event.messageReply) || (event.type !== "message" && event.type !== "message_reply")) return;
      if (err) return console.error(gradient.passion(err));

      if (event.type === "log:subscribe") {
        if (Array.isArray(event.logMessageData.addedParticipants)) {
          const botId = api.getCurrentUserID();
          const addedBots = event.logMessageData.addedParticipants.filter(p => p.userFbId == botId);
          if (addedBots.length > 0) {
            const threadID = event.threadID;
            logVIP(`🤖 Bot added to new group: ${threadID}`);
            let groups = readGroups();
            if (!groups.includes(threadID)) {
              groups.push(threadID);
              saveGroups(groups);
              logVIP(`💾 Saved new group ID: ${threadID}`);
            } else {
              logVIP(`ℹ️ Group ID already saved: ${threadID}`);
            }
          }
        }
      }

      const msg = event.body ? event.body.trim() : "";

      if (msg.startsWith(prefix)) {
        const args = msg.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commandName === "unsent") {
          if (event.messageReply?.messageID) {
            api.unsendMessage(event.messageReply.messageID, event.threadID, () => {
              api.sendMessage("✅ Message unsent successfully.", event.threadID, event.messageID);
            });
          } else {
            api.sendMessage("⚠️ Please reply to a message to unsent it.", event.threadID, event.messageID);
          }
          return;
        }

        const command = api.commands.get(commandName);
        if (!command || command.usePrefix === false) return;

        try {
          logVIP(`🛠️ Executing command: ${commandName} with args: [${args.join(", ")}]`);
          await command.execute({ api, event, args });
          logVIP(`✅ Command executed successfully: ${commandName}`);
        } catch (error) {
          logError(`Command execution failed: ${commandName}`, error);
          api.sendMessage("❌ An error occurred while executing the command.", event.threadID, event.messageID);
        }
        return;
      }

      for (const [name, command] of api.commands.entries()) {
        if (command.usePrefix === false) {
          const args = msg.split(/ +/);
          const commandName = args.shift().toLowerCase();

          if (commandName === name) {
            try {
              logVIP(`🛠️ Executing prefixless command: ${name} with args: [${args.join(", ")}]`);
              await command.execute({ api, event, args });
              logVIP(`✅ Prefixless command executed successfully: ${name}`);
            } catch (error) {
              logError(`Prefixless command execution failed: ${name}`, error);
              api.sendMessage("❌ An error occurred while executing the command.", event.threadID, event.messageID);
            }
            break;
          }
        }
      }
    });
  }
);
