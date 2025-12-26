const axios = require("axios");
const { cmd } = require("../command");
const { ytsearch } = require("@dark-yasiya/yt-dl.js");

cmd({
  pattern: "play",
  alias: ["ytplay", "song", "yta"],
  react: "🎵",
  desc: "Download YouTube audio using GiftedTech API",
  category: "download",
  use: ".play <song name or YouTube URL>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q, sender }) => {
  try {
    const input = q?.trim() || "Unity by Alan Walker"; // default search
    await conn.sendMessage(from, { react: { text: "🌀", key: mek.key } });
    await reply(`🎧 Searching for: *${input}*`);

    // 🔍 YouTube Search
    const search = await ytsearch(input);
    const vid = search?.results?.[0];
    if (!vid || !vid.url) return reply("❌ No results found!");

    const title = vid.title.replace(/[^\w\s.-]/gi, "").slice(0, 50);
    const videoUrl = vid.url;

    const caption = `
🪐 *Now Playing...*

📝 *Title:* ${vid.title}
⏱️ *Duration:* ${vid.timestamp || "Unknown"}
👁️ *Views:* ${vid.views || "Unknown"}
👤 *Author:* ${vid.author?.name || "Unknown"}

> ♻ *Converting to MP3...*
`.trim();

    await conn.sendMessage(from, {
      image: { url: vid.thumbnail },
      caption,
      contextInfo: {
        mentionedJid: [sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363403958418756@newsletter',
          newsletterName: "DML-PLAY",
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

    // 🎧 GiftedTech API (Your Required API)
    const api = `https://ytapi.giftedtech.co.ke/api/ytdla.php?url=${encodeURIComponent(videoUrl)}&stream=true`;

    const res = await axios.get(api, {
      responseType: "arraybuffer",
      timeout: 60000
    });

    if (!res.data) return reply("⚠️ Failed to fetch audio data.");

    await conn.sendMessage(from, {
      audio: Buffer.from(res.data),
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: mek });

    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

  } catch (err) {
    console.error("❌ Error in Our Server:", err);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    reply("⚠️ Something went wrong while downloading audio!");
  }
});
