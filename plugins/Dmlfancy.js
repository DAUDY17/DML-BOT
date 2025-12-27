const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "fancy",
  alias: ["font", "style"],
  react: "🚀",
  desc: "Convert text into various fonts.",
  category: "tools",
  filename: __filename
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q) {
      return reply(
        "❎ Please provide text to convert into fancy fonts.\n\n*Example:* .fancy Hello"
      );
    }

    const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.status) {
      return reply("❌ Error fetching fonts. Please try again later.");
    }

    // ===============================
    // FORMAT FONT RESULT
    // ===============================
    const fonts = response.data.result
      .map(item => `*${item.name}:*\n${item.result}`)
      .join("\n\n");

    const formattedInfo =
`😜 *Fancy Fonts Converter* ✨

${fonts}

> *DML-FANCY*`;

    // ===============================
    // RANDOM IMAGE LOGIC (WORKING)
    // ===============================
    let imageUrl = "https://files.catbox.moe/reypkp.jpg"; // fallback

    try {
      const scsFolder = path.join(__dirname, "../Dml");
      const images = fs
        .readdirSync(scsFolder)
        .filter(f => /^menu\d+\.jpg$/i.test(f));

      if (images.length > 0) {
        const randomImage =
          images[Math.floor(Math.random() * images.length)];
        imageUrl = path.join(scsFolder, randomImage);
      }
    } catch (err) {
      console.log("Random image fallback used:", err.message);
    }

    // ===============================
    // SEND IMAGE + CAPTION + CONTEXT
    // ===============================
    await conn.sendMessage(from, {
      image: { url: imageUrl },
      caption: formattedInfo,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363387497418815@newsletter",
          newsletterName: "DML-FANCY",
          serverMessageId: 143
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error("❌ Error in fancy command:", error);
    reply("⚠️ An error occurred while fetching fonts.");
  }
});
