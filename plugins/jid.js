const { cmd } = require('../command');

cmd({
    pattern: "jid",
    desc: "Get the JID of the user or group with newsletter format.",
    react: "📍",
    category: "group",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, sender, isOwner, reply }) => {
    try {
        // Permission check
        if (!isGroup && !isOwner) {
            return reply("⚠️ Only the bot owner or group admins can use this command.");
        }

        // Newsletter message configuration
        const newsletterConfig = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363403958418756@newsletter',
                newsletterName: 'DML-JID',
                serverMessageId: 143
            }
        };

        // Prepare the appropriate response
        const response = isGroup 
            ? `🔍 *Group JID*\n${from}`
            : `👤 *Your JID*\n${sender}@s.whatsapp.net`;

        // Send the newsletter-style message
        await conn.sendMessage(from, {
            text: response,
            contextInfo: newsletterConfig
        });

    } catch (e) {
        console.error("Error:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
//dml