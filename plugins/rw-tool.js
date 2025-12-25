const { cmd } = require("../command");
const axios = require("axios");

// VCard Contact (DML VERIFIED ✅)
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "DML VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:DML VERIFIED ✅\nORG:DML-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=255622220680:+255713541112\nEND:VCARD"
    }
  }
};

// Newsletter context
const newsletterContext = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363387497418815@newsletter",
      newsletterName: "DML-WALLPER",
      serverMessageId: 1
    }
  }
};

cmd({
  pattern: "rw",
  alias: ["randomw", "wallpaper"],
  react: "🖼",
  desc: "Download random wallpapers based on keywords.",
  category: "wallpapers",
  use: ".rw <keyword>",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const query = args.join(" ") || "random";
    const apiUrl = `https://pikabotzapi.vercel.app/random/randomwall/?apikey=anya-md&query=${encodeURIComponent(query)}`;

    const { data } = await axios.get(apiUrl);

    if (data.status && data.imgUrl) {
      const caption = `
╭━━〔  RANDOM WALLPAPER 〕━━╮
│ 🎯 *Query:* ${query}
│ ⚡ For more info follow our channel
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;

      await conn.sendMessage(from, {
        image: { url: data.imgUrl },
        caption,
        ...newsletterContext
      }, { quoted: quotedContact });

    } else {
      reply(`❌ No wallpaper found for *"${query}"*.`);
    }
  } catch (error) {
    console.error("Wallpaper Error:", error);
    reply("❌ An error occurred while fetching the wallpaper. Please try again.");
  }
});
