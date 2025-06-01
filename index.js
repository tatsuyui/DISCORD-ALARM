require("dotenv").config();
const axios = require("axios");
const { Client, GatewayIntentBits } = require("discord.js");

// ✅ LINE通知関数
const sendLineMessage = async (message) => {
  try {
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: process.env.LINE_USER_ID,
        messages: [
          {
            type: "text",
            text: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    // 通知失敗してもログは出さない（完全サイレント）
  }
};

// ✅ Discordクライアント設定
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!oldState.channel && newState.channel) {
    const user = newState.member.user.username;
    const channel = newState.channel.name;
    const actualUsers = [...newState.channel.members.values()].filter(m => !m.user.bot);
    const userCount = actualUsers.length;

    await sendLineMessage(`🔔 ${user} が ${channel} に参加しました（現在 ${userCount} 人）`);

    if (userCount === 3) {
      await sendLineMessage("🍽️ ドンスタやるぞ。あく。");
    } else if (userCount === 4) {
      await sendLineMessage("🎮 フルパ、フルパ！");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
