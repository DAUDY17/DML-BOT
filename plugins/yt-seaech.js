const { cmd } = require('../command');
const yts = require("yt-search");

cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    use: ".yts faded",
    react: "🔍",
    desc: "Search and get details from YouTube.",
    category: "search",
    filename: __filename
},

async (conn, mek, m, {
    from,
    args,
    q,
    reply
}) => {
    try {
        if (!q) return reply("Please provide a search query.");

        const searchQuery = q;
        await reply(`🔍 Dml-xmd Searching for "${searchQuery}"...`);

        const results = await yts(searchQuery);
        if (!results.videos.length) return reply("No results found.");

        let resultText = `*YouTube Search Results for "${searchQuery}"*\n\n`;

        results.videos.slice(0, 5).forEach((video, index) => {
            resultText += `*${index + 1}.* ${video.title}\n`;
            resultText += `URL: ${video.url}\n\n`;
        });

        const video = results.videos[0];
        const img = video.thumbnail;

        // =============================
        // FIRST MESSAGE (Search Results)
        // =============================
        await conn.sendMessage(from, {
            image: { url: img },
            caption: resultText,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403958418756@newsletter',
                    newsletterName: "╭••➤DML-XMD",
                    serverMessageId: 143,
                },
                forwardingScore: 999,
                externalAdReply: {
                    title: video.title,
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: img,
                    renderLargerThumbnail: false
                }
            }
        }, {
            quoted: {
                key: {
                    fromMe: false,
                    participant: `0@s.whatsapp.net`,
                    remoteJid: "status@broadcast"
                },
                message: {
                    contactMessage: {
                        displayName: "DML-YTS",
                        vcard: `BEGIN:VCARD
VERSION:3.0
N:DML-YTS;BOT;;;
FN:DML-YTS
item1.TEL;waid=255622220680:+255785591288
item1.X-ABLabel:Bot
END:VCARD`
                    }
                }
            }
        });

        // =============================
        // SECOND MESSAGE (Video Info)
        // =============================
        await conn.sendMessage(from, {
            image: { url: img },
            caption:
                `🎧 Duration: ${video.duration}\n` +
                `🔎 Views: ${video.views}\n` +
                `🔊 Channel: ${video.author.name}\n` +
                `\n*⇆ㅤ ||◁ㅤ❚❚ㅤ▷||ㅤ ↻*\n` +
                `0:00 ──〇─────── : ${video.duration}`,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403958418756@newsletter',
                    newsletterName: "╭••➤DML-YTS",
                    serverMessageId: 143,
                },
                forwardingScore: 999,
                externalAdReply: {
                    title: video.title,
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: img,
                    renderLargerThumbnail: false
                }
            }
        }, {
            quoted: {
                key: {
                    fromMe: false,
                    participant: `0@s.whatsapp.net`,
                    remoteJid: "status@broadcast"
                },
                message: {
                    contactMessage: {
                        displayName: "DML",
                        vcard: `BEGIN:VCARD
VERSION:3.0
N:DML-YTS;BOT;;;
FN:DML-YTS
item1.TEL;waid=255785591288:+255622220680
item1.X-ABLabel:Bot
END:VCARD`
                    }
                }
            }
        });

    } catch (err) {
        console.error(err);
        reply("An error occurred while searching for videos.");
    }
});
//dml
