const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "dml1",
    alias: ["thanksto"],
    desc: "thanks to dev for helping",
    category: "main",
    react: "🗯️",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const message =`╭━━━⪨ 𝗗𝗠𝗟 - 𝗠𝗗 ⪩━━━╮
┃ ✦ 👨‍💻 𝗗𝗘𝗩       : 𝗣𝗥𝗢𝗙-𝗗𝗠𝗟
┃ ✦ 🪀 𝗡𝗨𝗠𝗕𝗘𝗥    : +263 784 528 647
┃ ✦ 🛠️ 𝗕𝗢𝗧 𝗡𝗔𝗠𝗘 : DML
┃ ✦ 🙋‍♂️ 𝗛𝗜        : @${m.sender.split("@")[0]}
╰━━━━━━━━━━━━━━━┈⊷
     ⬩ *𝑃𝑂𝑊𝐸𝑅𝐸𝐷 𝐵𝑌 DML* ⬩`;

        await conn.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/7dkq50.jpg' },
            caption: message,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363387497418815@newsletter', // remplace avec ton vrai newsletterJid si besoin
                    newsletterName: 'DML-TECH',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (err) {
        console.error("ThanksTo Error:", err);
        await conn.sendMessage(from, { text: `Error: ${err.message}` }, { quoted: mek });
    }
});
                    
