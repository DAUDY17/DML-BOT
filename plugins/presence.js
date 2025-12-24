const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

// Helper function to load JSON
const loadJSON = (fileName) => {
    const filePath = path.join(__dirname, '../data', fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Single listener for all auto features
cmd({ on: "body" }, async (conn, mek, m, { from, body, isOwner }) => {
    const lowerBody = body.toLowerCase();

    // Auto Recording
    if (config.AUTO_RECORDING === 'true') {
        await conn.sendPresenceUpdate('recording', from);
    }

    // Auto Voice
    if (config.AUTO_VOICE === 'true') {
        const voiceData = loadJSON('autovoice.json');
        for (const text in voiceData) {
            if (lowerBody === text.toLowerCase()) {
                await conn.sendPresenceUpdate('recording', from);
                await conn.sendMessage(
                    from,
                    { audio: { url: voiceData[text] }, mimetype: 'audio/mpeg', ptt: true },
                    { quoted: mek }
                );
            }
        }
    }

    // Auto Sticker
    if (config.AUTO_STICKER === 'true') {
        const stickerData = loadJSON('autosticker.json');
        for (const text in stickerData) {
            if (lowerBody === text.toLowerCase()) {
                await conn.sendMessage(
                    from,
                    { sticker: { url: stickerData[text] }, package: 'silva spark🥰' },
                    { quoted: mek }
                );
            }
        }
    }

    // Auto Reply
    if (config.AUTO_REPLY === 'true') {
        const replyData = loadJSON('autoreply.json');
        for (const text in replyData) {
            if (lowerBody === text.toLowerCase()) {
                await m.reply(replyData[text]);
            }
        }
    }

    // Auto Typing (Composing)
    if (config.AUTO_TYPING === 'true') {
        await conn.sendPresenceUpdate('composing', from);
    }

    // Presence / Online Status
    try {
        if (config.ALWAYS_ONLINE === "true") {
            await conn.sendPresenceUpdate("available", from);
        } else if (config.PUBLIC_MODE === "true") {
            await conn.sendPresenceUpdate(isOwner ? "available" : "unavailable", from);
        } else {
            await conn.sendPresenceUpdate(isOwner ? "available" : "unavailable", from);
        }
    } catch (e) {
        console.error(e);
    }
});
