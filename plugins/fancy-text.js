const axios = require("axios");
const { cmd } = require("../command");

// Verified Contact Context
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "DML VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:DML VERIFIED ✅\nORG:DML-TECH;\nTEL;type=CELL;type=VOICE;waid=255713541112:+255 622 220680\nEND:VCARD"
    }
  }
};

cmd({
  pattern: "fancy",
  alias: ["font", "style"],
  react: "✍️",
  desc: "Convert text into various fonts.",
  category: "tools",
  filename: __filename
}, async (conn, m, store, { from, quoted, args, q, reply }) => {
  try {
    if (!q) {
      return reply("❎ *Please provide text to convert into fancy fonts.*\n\n_Example:_ `.fancy Hello`");
    }

    const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (!response.data.status) {
      return reply("❌ *Error fetching fonts. Please try again later.*");
    }

    const fonts = response.data.result.map(item => `╭─── ${item.name} ───⬣\n${item.result}`).join("\n\n");

    const resultText = `╭─❏ *Fancy Fonts Generator*\n│\n│ ✏️ *Input:* ${q}\n╰──────────────⬣\n\n${fonts}\n\n╭───〔 Powered by Dml───⬣`;

    await conn.sendMessage(from, {
      text: resultText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363403958418756@newsletter",
          newsletterName: "DML-FANCY",
          serverMessageId: 12
        }
      }
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("❌ Error in fancy command:", error);
    reply("⚠️ *An error occurred while fetching fancy fonts.*");
  }
});
//dml