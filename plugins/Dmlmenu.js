const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

// Random images
const MENU_IMAGES = [
    'https://files.catbox.moe/cbiufm.jpg',
    'https://files.catbox.moe/d4k0on.jpg',
    'https://files.catbox.moe/reypkp.jpg',
    'https://files.catbox.moe/9ryt34.jpg',
    'https://files.catbox.moe/juhq1l.jpg',
    'https://files.catbox.moe/zvh197.jpg'
];

// --------------------------------------------
// 🔥 AUTO GROUP COMMANDS BY CATEGORY
// --------------------------------------------
function buildDynamicMenu() {
    let categories = {};

    for (let name in commands) {
        let cmdObj = commands[name];

        // Default category
        if (!cmdObj.category) cmdObj.category = "Other";

        if (!categories[cmdObj.category]) {
            categories[cmdObj.category] = [];
        }

        // ✅ Resolve command name safely
        let commandName =
            cmdObj.pattern ||
            name ||
            (Array.isArray(cmdObj.alias) ? cmdObj.alias[0] : null) ||
            "unknown";

        categories[cmdObj.category].push(commandName);
    }

    let menuText = "";

    for (const category in categories) {
        menuText += `
╭━━━━━━━━━━━━━━━━━━━⭓
│ ⭐ *${category.toUpperCase()}*
╰━━━━━━━━━━━━━━━━━━━⭓
`;

        categories[category].forEach(cmdName => {
            menuText += `│ ▸ ${cmdName}\n`;
        });

        menuText += `╰━━━━━━━━━━━━━━━━━━━⭓\n`;
    }

    return {
        menuText,
        totalCommands: Object.keys(commands).length
    };
}


// --------------------------------------------
// DML MAIN MENU COMMAND
// --------------------------------------------
cmd({
    pattern: "menu",
    alias: ["allmenu", "fullmenu"],
    react: "📜",
    desc: "Auto generated full menu",
    category: "menu",
    filename: __filename
}, async (conn, mek, m, { from }) => {
    try {
        const selectedImage = MENU_IMAGES[Math.floor(Math.random() * MENU_IMAGES.length)];

        const { menuText, totalCommands } = buildDynamicMenu();

        const menuCaption = `
╭──⭘✋🏻 Hi *${config.BOT_NAME}* ─·⭘
┆ ◦ 👑 Owner : *${config.OWNER_NAME}*
┆ ◦ ⚙️ Prefix : *${config.PREFIX}*
┆ ◦ ⏱️ Runtime : *${runtime(process.uptime())}*
┆ ◦ 🧾 Total Commands : *${totalCommands}*
┆ ◦ 🤖 Dev : Dml
╰────────────────┈⊷

${menuText}

${config.DESCRIPTION}
`;

        await conn.sendMessage(
            from,
            {
                image: { url: selectedImage },
                caption: menuCaption
            },
            { quoted: mek }
        );

        console.log(`Command 'menu' loaded, total commands: ${totalCommands}`);
    } catch (err) {
        console.error(err);
    }
});
