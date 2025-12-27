const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "autobio",
    alias: ["togglebio", "bioauto"],
    desc: "Toggle the Auto Bio feature",
    category: "owner",
    react: "🚀",
    filename: __filename,
    fromMe: true
},
async (client, message, m, { isOwner, from, sender, args }) => {
    try {
        // ===============================
        // OWNER CHECK
        // ===============================
        if (!isOwner) {
            return client.sendMessage(from, {
                text: "🚫 Owner-only command",
                mentions: [sender]
            }, { quoted: message });
        }

        // ===============================
        // RANDOM IMAGE (UNCHANGED LOGIC)
        // ===============================
        const scsFolder = path.join(__dirname, "../Dml");
        const images = fs.readdirSync(scsFolder).filter(f => /^menu\d+\.jpg$/i.test(f));

        let imagePath = null;
        if (images.length > 0) {
            const randomImage = images[Math.floor(Math.random() * images.length)];
            imagePath = path.join(scsFolder, randomImage);
        }

        // ===============================
        // COMMAND ACTION
        // ===============================
        const action = args[0]?.toLowerCase() || "status";
        let statusText = "";
        let reaction = "⚡";
        let extra = "";

        switch (action) {
            case "on":
                if (config.AUTO_BIO === "true") {
                    statusText = "Auto Bio is already *ENABLED* ✅";
                    reaction = "ℹ️";
                } else {
                    config.AUTO_BIO = "true";
                    statusText = "Auto Bio has been *ENABLED* ✅";
                    reaction = "✅";
                    extra = "The bot will now update its bio automatically.";
                }
                break;

            case "off":
                if (config.AUTO_BIO === "false") {
                    statusText = "Auto Bio is already *DISABLED* ❌";
                    reaction = "ℹ️";
                } else {
                    config.AUTO_BIO = "false";
                    statusText = "Auto Bio has been *DISABLED* ❌";
                    reaction = "❌";
                    extra = "The bot will stop updating its bio.";
                }
                break;

            default:
                statusText = `Auto Bio Status: ${
                    config.AUTO_BIO === "true"
                        ? "✅ *ENABLED*"
                        : "❌ *DISABLED*"
                }`;
                extra = config.AUTO_BIO === "true"
                    ? "The bot is currently updating its bio automatically."
                    : "The bot is not updating its bio.";
                reaction = "ℹ️";
                break;
        }

        // ===============================
        // SEND MESSAGE
        // ===============================
        const msgPayload = imagePath
            ? {
                image: { url: imagePath },
                caption: `${statusText}\n\n${extra}\n\nDML-AUTOBIO`
            }
            : {
                text: `${statusText}\n\n${extra}\n\nDML-AUTOBIO`
            };

        await client.sendMessage(from, {
            ...msgPayload,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363403958418756@newsletter",
                    newsletterName: "DML-AUTOBIO",
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

        // ===============================
        // REACT
        // ===============================
        await client.sendMessage(from, {
            react: { text: reaction, key: message.key }
        });

        // ===============================
        // SAVE CONFIG
        // ===============================
        try {
            const configPath = path.join(__dirname, "..", "config.js");
            let file = fs.readFileSync(configPath, "utf8");
            file = file.replace(
                /AUTO_BIO:\s*".*?"/,
                `AUTO_BIO: "${config.AUTO_BIO}"`
            );
            fs.writeFileSync(configPath, file);
        } catch (e) {
            console.error("⚠️ Failed to save AUTO_BIO:", e);
        }

    } catch (error) {
        console.error("AutoBio Error:", error);
        await client.sendMessage(from, {
            text: `⚠️ Error: ${error.message}`,
            mentions: [sender]
        }, { quoted: message });
    }
});
