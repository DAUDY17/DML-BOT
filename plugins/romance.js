const { cmd, commands } = require("../command");
const axios = require('axios');
const translate = require('@vitalets/google-translate-api');

cmd({
    pattern: "romance",
    desc: "Romantic shayari ",
    category: "fun",
    react: "❤️",
    filename: __filename,
    use: ".romance"
},
async (conn, m, { reply }) => {
    try {
        const res = await axios.get('https://farzi-vichar-api.vercel.app/category/love/random');
        const original = res.data.content;
        const translation = await translate(original, { to: 'ur', from: 'hi' });

        await reply(`❤️ *Romantic Shayari (Roman)*:\n\n${translation.text}`);
    } catch (e) {
        console.error(e);
        reply("❌ Couldn't fetch or translate romantic shayari.");
    }
});


cmd({
    pattern: "motivate",
    desc: "Random motivational quote in Roman ",
    category: "fun",
    react: "✨",
    filename: __filename,
    use: ".motivate"
},
async (conn, m, { reply }) => {
    try {
        const res = await axios.get('https://type.fit/api/quotes');
        const random = res.data[Math.floor(Math.random() * res.data.length)];
        const translated = await translate(random.text, { to: 'ur', from: 'en' });

        await reply(`✨ *Motivational Quote (Roman )*:\n\n${translated.text}`);
    } catch (e) {
        console.error(e);
        reply("❌ Couldn't fetch or translate motivation.");
    }
});
