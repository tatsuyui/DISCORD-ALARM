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
    // サイレント
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
  // 参加イベントのみ検知
  if (!oldState.channel && newState.channel) {
    const user = newState.member.user.username;
    const channel = newState.channel.name;

    // Botを除いた現在の通話参加人数
    const actualUsers = [...newState.channel.members.values()].filter(m => !m.user.bot);
    const userCount = actualUsers.length;

    // 1～2人のときは通知しない
    if (userCount < 3) return;

    // 3人以上の場合だけ参加通知
    await sendLineMessage(`🔔 ${user} が ${channel} に参加しました（現在 ${userCount} 人）`);

    // 特定人数でメッセージ送信
    if (userCount === 3) {
      await sendLineMessage("🍽️ ドンスタやるぞ。あく。");
    } else if (userCount === 4) {
      await sendLineMessage("🎮 フルパ、フルパ！");
    } else if (userCount === 6) {
      await sendLineMessage("🗣️ あと一人！");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
