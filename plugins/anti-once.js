const { cmd } = require("../command");

cmd({
  pattern: "vv2",
  alias: ["channelinfo", "info"],
  desc: "View channel details or retrieve quoted messages",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isCreator }) => {
  try {
    // Verify bot owner
    if (!isCreator) {
      return await client.sendMessage(from, {
        text: "🔒 You are not authorized to use this command!"
      }, { quoted: message });
    }

    const channelJid = "120363387497418815@newsletter";

    // 1. VIEW CHANNEL INFORMATION
    if (match && typeof match === "string" && match.toLowerCase().includes("channel")) {
      try {
        // Get channel metadata
        const metadata = await client.groupMetadata(channelJid);
        
        // Get participants list
        const participants = metadata.participants || [];
        
        // Prepare information message
        const infoMsg = `📢 *CHANNEL INFORMATION*\n\n` +
                       `🔹 *Name:* ${metadata.subject || 'No name'}\n` +
                       `🔹 *ID:* ${metadata.id}\n` +
                       `🔹 *Members:* ${participants.length}\n` +
                       `🔹 *Created:* ${metadata.creation ? new Date(metadata.creation * 1000).toLocaleString() : 'Unknown date'}\n\n` +
                       `📝 *Description:*\n${metadata.desc || 'No description'}\n\n` +
                       `📌 *Admins:*\n${participants.filter(p => p.admin).map(p => `➤ @${p.id.split('@')[0]}`).join('\n') || 'None'}`;

        // Send information
        await client.sendMessage(from, { 
          text: infoMsg,
          mentions: participants.filter(p => p.admin).map(p => p.id)
        }, { quoted: message });

        // Show sample members (first 5)
        if (participants.length > 0) {
          const sampleMembers = participants.slice(0, 5).map(p => `@${p.id.split('@')[0]}`).join(' ');
          await client.sendMessage(from, {
            text: `👥 *Sample Members (${participants.length} total):* ${sampleMembers}${participants.length > 5 ? '...' : ''}`,
            mentions: participants.slice(0, 5).map(p => p.id)
          }, { quoted: message });
        }

      } catch (error) {
        console.error("Channel Error:", error);
        await client.sendMessage(from, {
          text: `❌ Failed to get channel info:\n${error.message}\n\n` +
                `Please verify:\n` +
                `1. Bot is in the channel\n` +
                `2. Channel JID is correct\n` +
                `Current JID: ${channelJid}`
        }, { quoted: message });
      }
      return;
    }

    // 2. ORIGINAL VIEW-ONCE MESSAGE FUNCTIONALITY
    if (!message.quoted) {
      return await client.sendMessage(from, {
        text: `*How to use vv2:*\n\n` +
              `1. Reply to view-once message with "vv2"\n` +
              `2. View channel info with "vv2 channel"\n\n` +
              `Current channel JID:\n${channelJid}`
      }, { quoted: message });
    }

    // Process view-once message
    try {
      const buffer = await message.quoted.download();
      const mtype = message.quoted.mtype;

      let content = {};
      switch (mtype) {
        case "imageMessage":
          content = { 
            image: buffer, 
            mimetype: message.quoted.mimetype || "image/jpeg",
            caption: message.quoted.caption || ""
          };
          break;
        case "videoMessage":
          content = { 
            video: buffer, 
            mimetype: message.quoted.mimetype || "video/mp4",
            caption: message.quoted.caption || ""
          };
          break;
        case "audioMessage":
          content = { 
            audio: buffer, 
            mimetype: message.quoted.mimetype || "audio/mp4",
            ptt: message.quoted.ptt || false
          };
          break;
        default:
          return await client.sendMessage(from, {
            text: "❌ Only images, videos and audio messages can be retrieved"
          }, { quoted: message });
      }

      await client.sendMessage(message.sender, content, { quoted: message });
      
    } catch (error) {
      console.error("View Once Error:", error);
      await client.sendMessage(from, {
        text: "❌ Failed to retrieve message:\n" + 
              `${error.message}\n\n` +
              `Try again or check if the message still exists`
      }, { quoted: message });
    }

  } catch (error) {
    console.error("vv2 Main Error:", error);
    await client.sendMessage(from, {
      text: "❌ Unexpected command failure:\n" +
            `${error.message}\n\n` +
            `Please report this error to the developer`
    }, { quoted: message });
  }
});
