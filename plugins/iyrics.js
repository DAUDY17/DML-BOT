const { cmd } = require("../command");
const fetch = require("node-fetch");

const lyricsCmd = {
  pattern: "lyrics", // fixed typo
  alias: ["lyric"],
  desc: "Get song lyrics",
  category: "music",
  use: "<song title>"
};

cmd(lyricsCmd, async (_dest, _zk, _commandOptions, { text, prefix, command, reply }) => {
  if (!text) {
    return reply(
      "Please provide a song title.\nExample: *" + prefix + command + " robbery*"
    );
  }

  const query = encodeURIComponent(text);
  const apiUrl = `https://some-random-api.com/lyrics?title=${query}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.lyrics) {
      return reply("❌ Lyrics not found.");
    }

    let message = `🎵 *${data.title}*\n👤 Artist: ${data.author}\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙽𝙾𝚅𝙰-𝚇𝙼𝙳*💫\n\n📄 *Lyrics:*\n${data.lyrics}`;

    await reply(message.trim());
  } catch (err) {
    console.error(err);
    reply("❌ Failed to fetch lyrics. Try again later.");
  }
});
