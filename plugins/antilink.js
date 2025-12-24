const { cmd } = require('../command');
const config = require("../config");

// Store warnings and settings
global.warnings = global.warnings || {};
const linkSettings = {
    enabled: config.ANTI_LINK === 'true',
    whitelist: [], // Add whitelisted domains if needed
    maxWarnings: 3,
    deleteMessage: true,
    warnMessage: true,
    removeUser: true
};

cmd({
    pattern: 'antilink',
    desc: 'Toggle anti-link feature',
    category: 'moderation',
    use: '<on/off>'
}, async (conn, m, _, { isGroup, isBotAdmins, reply }) => {
    if (!isGroup || !isBotAdmins) return reply('❌ This command only works in groups where I\'m admin');
    
    const action = m.text?.toLowerCase()?.split(' ')[1];
    if (action === 'on') {
        linkSettings.enabled = true;
        return reply('✅ Anti-link protection enabled');
    } else if (action === 'off') {
        linkSettings.enabled = false;
        return reply('❌ Anti-link protection disabled');
    } else {
        return reply(`Current status: ${linkSettings.enabled ? '✅ ON' : '❌ OFF'}\nUsage: .antilink <on/off>`);
    }
});

cmd({
    on: 'text'
}, async (conn, m, _, { from, text, sender, isGroup, isAdmins, isBotAdmins }) => {
    try {
        // Only act in groups where bot is admin and sender isn't admin
        if (!isGroup || isAdmins || !isBotAdmins || !linkSettings.enabled) return;

        // Enhanced link detection patterns
        const linkPatterns = [
            /(?:https?:\/\/|www\.)[^\s]+/gi, // Catch all URLs
            /chat\.whatsapp\.com\/\S+/gi,
            /wa\.me\/\S+/gi,
            /t\.me\/\S+/gi,
            /youtu\.?be(?:\.com)?\/\S+/gi,
            /instagram\.com\/\S+/gi,
            /facebook\.com\/\S+/gi,
            /twitter\.com\/\S+/gi,
            /x\.com\/\S+/gi,
            /tiktok\.com\/\S+/gi,
            /discord\.gg\/\S+/gi
        ];

        // Check for whitelisted domains first
        const isWhitelisted = linkSettings.whitelist.some(domain => 
            text.toLowerCase().includes(domain.toLowerCase())
        );

        // Check if message contains any forbidden links
        const containsLink = !isWhitelisted && 
            linkPatterns.some(pattern => pattern.test(text));

        if (containsLink) {
            console.log(`[ANTI-LINK] Link detected from ${sender}: ${text}`);

            // Delete the message if enabled
            if (linkSettings.deleteMessage) {
                try {
                    await conn.sendMessage(from, {
                        delete: {
                            id: m.key.id,
                            remoteJid: from,
                            fromMe: false
                        }
                    });
                    console.log(`[ANTI-LINK] Message deleted: ${m.key.id}`);
                } catch (error) {
                    console.error("[ANTI-LINK] Failed to delete message:", error);
                }
            }

            // Update warning count
            global.warnings[sender] = (global.warnings[sender] || 0) + 1;
            const warningCount = global.warnings[sender];

            // Send warning if enabled
            if (linkSettings.warnMessage && warningCount <= linkSettings.maxWarnings) {
                await conn.sendMessage(from, {
                    text: `⚠️ *LINK DETECTED* ⚠️\n\n` +
                          `• User: @${sender.split('@')[0]}\n` +
                          `• Warnings: ${warningCount}/${linkSettings.maxWarnings}\n` +
                          `• Action: ${warningCount >= linkSettings.maxWarnings ? 'Removal' : 'Warning'}\n\n` +
                          `_Links are not allowed in this group!_`,
                    mentions: [sender]
                }, { quoted: m });
            }

            // Remove user if they exceed max warnings
            if (linkSettings.removeUser && warningCount >= linkSettings.maxWarnings) {
                try {
                    await conn.groupParticipantsUpdate(from, [sender], "remove");
                    await conn.sendMessage(from, {
                        text: `🚫 @${sender.split('@')[0]} has been removed for sending links!`,
                        mentions: [sender]
                    });
                    delete global.warnings[sender];
                } catch (removeError) {
                    console.error("[ANTI-LINK] Failed to remove user:", removeError);
                    await conn.sendMessage(from, {
                        text: `⚠️ Failed to remove @${sender.split('@')[0]}! Please check my admin permissions.`,
                        mentions: [sender]
                    });
                }
            }
        }
    } catch (error) {
        console.error("[ANTI-LINK] System error:", error);
    }
});

// Reset warnings daily
setInterval(() => {
    global.warnings = {};
    console.log('[ANTI-LINK] Warnings reset');
}, 24 * 60 * 60 * 1000);
