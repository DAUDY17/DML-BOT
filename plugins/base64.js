const { sleep } = require('../lib/functions');
const {cmd , commands} = require('../command')

cmd({
    pattern: "color",
    desc: "Generate a random color with name and code.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { reply }) => {
    try {
        const colorNames = [
            "Red", "Green", "Blue", "Yellow", "Orange", "Purple", "Pink", "Brown", "Black", "White", 
            "Gray", "Cyan", "Magenta", "Violet", "Indigo", "Teal", "Lavender", "Turquoise"
        ];
        
        const randomColorHex = "#" + Math.floor(Math.random()*16777215).toString(16);
        const randomColorName = colorNames[Math.floor(Math.random() * colorNames.length)];

        await conn.sendMessage(m.chat, {
            text: `🎨 *Random Color:* \nName: ${randomColorName}\nCode: ${randomColorHex}`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: '𝙽𝙾𝚅𝙰-𝚇𝙼𝙳',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.error("Error in .randomcolor command:", e);
        reply("❌ An error occurred while generating the random color.");
    }
});

//base64 
cmd({
    pattern: "base64",
    desc: "Encode text into Base64 format.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply("Please provide the text to encode into Base64.");
        }
        
        const textToEncode = args.join(" ");
        const encodedText = Buffer.from(textToEncode).toString('base64');
        
        await conn.sendMessage(m.chat, {
            text: `🔑 *Encoded Base64 Text:* \n${encodedText}`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: '𝙽𝙾𝚅𝙰-𝚇𝙼𝙳',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.error("Error in .base64 command:", e);
        reply("❌ An error occurred while encoding the text into Base64.");
    }
});

cmd({
    pattern: "unbase64",
    desc: "Decode Base64 encoded text.",
    category: "utility",
    filename: __filename,
}, 
async (conn, mek, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply("Please provide the Base64 encoded text to decode.");
        }
    
        const base64Text = args.join(" ");
        const decodedText = Buffer.from(base64Text, 'base64').toString('utf-8');
        
        await conn.sendMessage(m.chat, {
            text: `🔓 *Decoded Text:* \n${decodedText}`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: '𝙽𝙾𝚅𝙰-𝚇𝙼𝙳',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    } catch (e) {
        console.error("Error in .unbase64 command:", e);
        reply("❌ An error occurred while decoding the Base64 text.");
    }
});
