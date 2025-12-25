const config = require('../config')
const { cmd } = require('../command')

const quotedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "DML VERIFIED ✅",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:DML VERIFIED ✅\nORG:DML-TECH;\nTEL;type=CELL;type=VOICE;waid=255622220680:255713541112\nEND:VCARD"
        }
    }
};

cmd({
    pattern: "updategdesc",
    alias: ["upgdesc", "gdesc"],
    react: "📜",
    desc: "Change the group description.",
    category: "group",
    filename: __filename
},           
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363403958418756@newsletter",
            newsletterName: "DML",
            serverMessageId: 1
        }
    };

    if (!isGroup) return reply(`
╭───「 *ERROR* 」───╮
│ ❌ This command can only be used in groups.
╰──────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    if (!isAdmins) return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 Only group admins can use this command.
╰──────────────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    if (!isBotAdmins) return reply(`
╭───「 *BOT ERROR* 」───╮
│ ⚠️ I need to be an admin to update the group description.
╰──────────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    if (!q) return reply(`
╭───「 *USAGE* 」───╮
│ ❌ Please provide a new group description.
╰──────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo });

    try {
        await conn.groupUpdateDescription(from, q);
        return reply(`
╭───「 *SUCCESS* 」───╮
│ ✅ Group description has been updated.
╰───────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    } catch (e) {
        console.error("Error updating group description:", e);
        return reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to update the group description. Please try again.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    }
});
            
//dml