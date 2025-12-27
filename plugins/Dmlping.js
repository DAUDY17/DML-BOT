const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');

/* ===================== PI COMMAND ===================== */

cmd({
    pattern: "ping",
    alias: ["speed","pong"],
    use: '.ping',
    desc: "Check bot's response time.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, quoted, sender, reply }) => {
    try {
        const start = new Date().getTime();

        /* ===== ADDED: LOAD RANDOM IMAGE FROM /Dml ===== */
        const dmlFolder = path.join(__dirname, "../Dml");
        let imageBuffer = null;

        if (fs.existsSync(dmlFolder)) {
            const images = fs.readdirSync(dmlFolder)
                .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
            if (images.length > 0) {
                const randomImage = images[Math.floor(Math.random() * images.length)];
                imageBuffer = fs.readFileSync(path.join(dmlFolder, randomImage));
            }
        }
        /* ================================================= */

        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

        const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

        while (textEmoji === reactionEmoji) {
            textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
        }

        // Original reaction (UNCHANGED)
        await conn.sendMessage(from, {
            react: { text: textEmoji, key: mek.key }
        });

        const end = new Date().getTime();
        const responseTime = (end - start);

        const text = `
╔════❰ 𝗗𝗠𝗟-𝗠𝗗 𝗦𝗣𝗘𝗘𝗗 ❱════╗
║
║ ⚡ *Response Time:* ${responseTime}ms ${reactionEmoji}
║
╚═════════════════════╝
`;

        // SEND WITH IMAGE IF AVAILABLE (ADDED ONLY)
        if (imageBuffer) {
            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: text,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403958418756@newsletter',
                        newsletterName: "DML-PING",
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                text,
                contextInfo: {
                    mentionedJid: [sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363403958418756@newsletter',
                        newsletterName: "DML-PING",
                        serverMessageId: 143
                    }
                }
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Error in ping command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


/* ===================== PI2 COMMAND ===================== */

cmd({
    pattern: "ping2",
    desc: "Check bot's response time.",
    category: "main",
    react: "♻",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const startTime = Date.now();
        const message = await conn.sendMessage(from, { text: '*PINGING...*' });
        const endTime = Date.now();
        const ping = endTime - startTime;

        /* ===== ADDED: LOAD RANDOM IMAGE FROM /Dml ===== */
        const dmlFolder = path.join(__dirname, "../Dml");
        let imageBuffer = null;

        if (fs.existsSync(dmlFolder)) {
            const images = fs.readdirSync(dmlFolder)
                .filter(file => /\.(jpg|jpeg|png)$/i.test(file));
            if (images.length > 0) {
                const randomImage = images[Math.floor(Math.random() * images.length)];
                imageBuffer = fs.readFileSync(path.join(dmlFolder, randomImage));
            }
        }
        /* ================================================= */

        if (imageBuffer) {
            await conn.sendMessage(from, {
                image: imageBuffer,
                caption: `*🔥 DML-MD SPEED : ${ping}ms*`
            }, { quoted: message });
        } else {
            await conn.sendMessage(from, {
                text: `*🔥 DML-MD SPEED : ${ping}ms*`
            }, { quoted: message });
        }

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
