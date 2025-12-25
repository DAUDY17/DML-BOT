const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

// Auto Sticker
cmd({
  on: "body"
}, async (conn, mek, m, { from, body, isOwner }) => {
    if (config.AUTO_STICKER !== 'true') return; // check if auto sticker is enabled

    const filePath = path.join(__dirname, '../data/autosticker.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const lowerBody = body.toLowerCase();

    for (const text in data) {
        if (lowerBody === text.toLowerCase()) {
            // Reply with sticker URL from JSON
            await m.reply({ sticker: { url: data[text] } });
            break; // Stop after first match
        }
    }
});
