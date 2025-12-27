const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
    pattern: "tiny",
    alias: ["short", "shorturl"],
    react: "✅",
    desc: "Makes URL tiny.",
    category: "convert",
    use: "<url>",
    filename: __filename,
},
async (conn, mek, m, { from, reply, args }) => {

    console.log("Command tiny triggered");

    if (!args[0]) {
        console.log("No URL provided");
        return reply("*❎ Please provide me a link.*");
    }

    // ===============================
    // RANDOM IMAGE LOGIC (FIXED)
    // ===============================
    let imageUrl = "https://files.catbox.moe/reypkp.jpg"; // fallback

    try {
        const scsFolder = path.join(__dirname, "../Dml");
        const images = fs
            .readdirSync(scsFolder)
            .filter(f => /^menu\d+\.jpg$/i.test(f));

        if (images.length > 0) {
            const randomImage =
                images[Math.floor(Math.random() * images.length)];
            imageUrl = path.join(scsFolder, randomImage);
        }
    } catch (err) {
        console.log("Image fallback used:", err.message);
    }

    try {
        const link = args[0];
        console.log("URL to shorten:", link);

        const response = await axios.get(
            `https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`
        );

        const shortenedUrl = response.data;
        console.log("Shortened URL:", shortenedUrl);

        const caption = `*🔰 YOUR SHORTENED URL*

🔗 Original:
${link}

✂️ Shortened:
${shortenedUrl}

> © Powered By Dml`;

        // Send image + caption
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: caption,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363403958418756@newsletter",
                    newsletterName: "DML-TINY",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error shortening URL:", e);
        return reply("❌ An error occurred while shortening the URL. Please try again.");
    }
});
