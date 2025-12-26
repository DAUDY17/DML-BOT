const { cmd } = require('../command');
const axios = require('axios');

// Contact verified
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "DML VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:DML VERIFIED ✅\nORG:DML-TECH;\nTEL;type=CELL;type=VOICE;waid=255713541112:+255 713 541112\nEND:VCARD"
    }
  }
};

cmd({
  pattern: "img",
  alias: ['image', 'googleimage', "searchimg"],
  react: '🦋',
  desc: "Search and download Google images",
  category: "fun",
  use: ".img <keywords>",
  filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
  try {
    const query = args.join(" ");
    if (!query) return reply("🖼️ *Please provide search keywords!*\n_Example: .img cute cats_");

    await reply(`🔍 *Searching images for:* "${query}" ...`);

    const res = await axios.get(`https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`);
    if (!res.data?.success || !res.data.results?.length) {
      return reply("❌ *No images found. Try different keywords.*");
    }

    const results = res.data.results;
    const randomResults = results.sort(() => 0.5 - Math.random()).slice(0, 5);

    for (const imgUrl of randomResults) {
      await conn.sendMessage(from, {
        image: { url: imgUrl },
        caption: `╭───〔 *Image Result* 〕───⬣\n📷 Query: *${query}*\n🔗 Source: Google\n╰──DML──`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363403958418756@newsletter",
            newsletterName: "DML",
            serverMessageId: 10
          }
        }
      }, { quoted: quotedContact });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (err) {
    console.error("Image Search Error:", err);
    reply(`❌ *Error fetching images:*\n${err.message}`);
  }
});
