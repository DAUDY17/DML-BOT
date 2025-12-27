const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "menu",
    alias: ["allmenu", "fullmenu"],
    desc: "Show all bot commands",
    category: "menu",
    react: "⤵️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // ===============================
        // RANDOM IMAGE (AS YOU REQUESTED)
        // ===============================
        const scsFolder = path.join(__dirname, "../Dml");
        const images = fs.readdirSync(scsFolder).filter(f => /^menu\d+\.jpg$/i.test(f));
        const randomImage = images[Math.floor(Math.random() * images.length)];
        const imagePath = path.join(scsFolder, randomImage);

        // ===============================
        // AUTO MENU GENERATION
        // ===============================
        const menu = {};

        for (const c of commands) {
            if (!c.pattern) continue;

            const category = c.category || "other";
            if (!menu[category]) menu[category] = [];
            menu[category].push(c.pattern);
        }

        // ===============================
        // MENU HEADER
        // ===============================
        let dec = `╭─〔 🚀 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 〕─╮
┃ 👑 Owner     : ${config.OWNER_NAME}
┃ ⚙️ Prefix    : ${config.PREFIX}
┃ 🌐 Platform  : ${config.PLATFORM || "Node.js"}
┃ 📦 Version   : ${config.VERSION || "1.0.0"}
┃ ⏱️ Runtime   : ${runtime(process.uptime())}
╰────────────────────────╯\n\n`;

        // ===============================
        // CATEGORY ICONS (OPTIONAL)
        // ===============================
        const icons = {
            menu: "📜",
            main: "⚡",
            ai: "🤖",
            fun: "🎉",
            group: "👥",
            owner: "👑",
            download: "📥",
            anime: "🎎",
            convert: "🔄",
            logo: "🎨",
            reaction: "🎭",
            other: "ℹ️"
        };

        // ===============================
        // BUILD MENU TEXT
        // ===============================
        for (const category in menu) {
            const icon = icons[category] || "📂";

            dec += `╭──〔 ${icon} ${category.toUpperCase()} MENU 〕──╮\n`;
            menu[category].forEach(command => {
                dec += `┃ • ${config.PREFIX}${command}\n`;
            });
            dec += `╰────────────────────────╯\n\n`;
        }

        // ===============================
        // SEND MENU
        // ===============================
        await conn.sendMessage(
            from,
            {
                image: { url: imagePath },
                caption: dec,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true
                }
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply(`❌ Menu Error: ${e.message}`);
    }
});
