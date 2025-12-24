const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");
const path = require("path");

// Toggle Auto Bio Command
cmd({
    pattern: "autobio",
    alias: ["togglebio", "bioauto"],
    desc: "Toggle the Auto Bio feature",
    category: "owner",
    react: "⚡",
    filename: __filename,
    fromMe: true
}, 
async (client, message, m, { isOwner, from, sender, args, prefix }) => {
    try {
        if (!isOwner) {
            return client.sendMessage(from, { 
                text: "🚫 Owner-only command",
                mentions: [sender]
            }, { quoted: message });
        }

        const action = args[0]?.toLowerCase() || "status";
        let statusText, reaction = "⚡", extra = "";

        switch (action) {
            case "on":
                if (config.AUTO_BIO === "true") {
                    statusText = "Auto Bio is already *enabled* ✅";
                    reaction = "ℹ️";
                } else {
                    config.AUTO_BIO = "true";
                    statusText = "Auto Bio has been *enabled*! ✅";
                    reaction = "✅";
                    extra = "The bot will now automatically update its bio.";
                }
                break;

            case "off":
                if (config.AUTO_BIO === "false") {
                    statusText = "Auto Bio is already *disabled* ❌";
                    reaction = "ℹ️";
                } else {
                    config.AUTO_BIO = "false";
                    statusText = "Auto Bio has been *disabled*! ❌";
                    reaction = "❌";
                    extra = "The bot will stop updating its bio.";
                }
                break;

            default:
                statusText = `Auto Bio Status: ${config.AUTO_BIO === "true" ? "✅ *ENABLED*" : "❌ *DISABLED*"}`;
                extra = config.AUTO_BIO === "true" 
                    ? "The bot is updating its bio automatically."
                    : "The bot is not updating its bio.";
                break;
        }

        // Send status response
        await client.sendMessage(from, {
            image: { url: "https://files.catbox.moe/4j07ae.jpg" },
            caption: `${statusText}\n\n${extra}\n\n_Nova-Xmd_`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: 'Nova-Xmd',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

        // React to the command
        await client.sendMessage(from, {
            react: { text: reaction, key: message.key }
        });

        // Optional: persist setting to config.js
        try {
            const configPath = path.join(__dirname, "..", "config.js");
            let configFile = fs.readFileSync(configPath, "utf8");
            configFile = configFile.replace(/AUTO_BIO:\s*".*"/, `AUTO_BIO: "${config.AUTO_BIO}"`);
            fs.writeFileSync(configPath, configFile);
        } catch (e) {
            console.error("⚠️ Failed to save AUTO_BIO config:", e);
        }

    } catch (error) {
        console.error("Auto Bio command error:", error);
        await client.sendMessage(from, { 
            text: `⚠️ Error: ${error.message}`,
            mentions: [sender]
        }, { quoted: message });
    }
});
                        
