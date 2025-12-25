const { cmd } = require('../command');

// Contact for verified appearance
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "DML VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:DML VERIFIED ✅\nORG:DML-TECH;\nTEL;type=CELL;type=VOICE;waid=255622220680:+255 713 541112\nEND:VCARD"
    }
  }
};

cmd({
  pattern: "hidetag",
  alias: ["tag", "h"],
  react: "🔊",
  desc: "To Tag all Members for Any Message/Media",
  category: "group",
  use: '.hidetag Hello',
  filename: __filename
},
async (conn, mek, m, {
  from, q, isGroup, isCreator, isAdmins,
  participants, reply
}) => {
  try {
    const isUrl = (url) => {
      return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
    };

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isCreator) return reply("❌ Only group admins can use this command.");

    const mentionAll = {
      mentions: participants.map(u => u.id),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363403958418756@newsletter",
          newsletterName: "DML-TAG",
          serverMessageId: 13
        }
      }
    };

    if (!q && !m.quoted) return reply("❌ Reply or write a message to tag all members.");

    if (m.quoted) {
      const type = m.quoted.mtype || '';
      const buffer = await m.quoted.download?.();

      switch (type) {
        case 'imageMessage':
          return await conn.sendMessage(from, {
            image: buffer,
            caption: m.quoted.text || "📷 Image",
            ...mentionAll
          }, { quoted: quotedContact });

        case 'videoMessage':
          return await conn.sendMessage(from, {
            video: buffer,
            caption: m.quoted.text || "🎥 Video",
            gifPlayback: m.quoted.message?.videoMessage?.gifPlayback || false,
            ...mentionAll
          }, { quoted: quotedContact });

        case 'audioMessage':
          return await conn.sendMessage(from, {
            audio: buffer,
            mimetype: "audio/mp4",
            ptt: m.quoted.message?.audioMessage?.ptt || false,
            ...mentionAll
          }, { quoted: quotedContact });

        case 'stickerMessage':
          return await conn.sendMessage(from, {
            sticker: buffer,
            ...mentionAll
          }, { quoted: quotedContact });

        case 'documentMessage':
          return await conn.sendMessage(from, {
            document: buffer,
            mimetype: m.quoted.message?.documentMessage?.mimetype || "application/octet-stream",
            fileName: m.quoted.message?.documentMessage?.fileName || "file",
            caption: m.quoted.text || "",
            ...mentionAll
          }, { quoted: quotedContact });

        case 'extendedTextMessage':
        default:
          return await conn.sendMessage(from, {
            text: `╭─── *HIDETAG MESSAGE* \n│\n│ ${m.quoted.text || '📨 Message'}\n│\n╰──DML`,
            ...mentionAll
          }, { quoted: quotedContact });
      }
    }

    if (q) {
      return await conn.sendMessage(from, {
        text: `╭─── *HIDETAG MESSAGE* \n│\n│ ${q}\n│\n╰──DML`,
        ...mentionAll
      }, { quoted: quotedContact });
    }

  } catch (e) {
    console.error("❌ Hidetag Error:", e);
    reply(`❌ *An error occurred:*\n${e.message}`);
  }
});
//dml