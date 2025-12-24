const { cmd } = require('../command');

cmd({
    pattern: "remove",
    alias: ["kick", "k", "out"],
    desc: "Removes a member from the group",
    category: "admin",
    react: "❌",
    filename: __filename
},
async (Void, msg, {
    from, args, isGroup, isBotAdmin, reply, quoted, sender, groupMetadata
}) => {
    // Check if the command is used in a group
    if (!isGroup) return await reply("❌ This command can only be used in groups.");

    // Check if the bot is an admin
    if (!isBotAdmin) return await reply("❌ I need to be an admin to use this command.");

    // Get group metadata
    const metadata = await Void.groupMetadata(from).catch(() => null);
    if (!metadata) return await reply("❌ Failed to fetch group info.");

    // Check if sender is admin
    const participant = metadata.participants.find(p => p.id === sender);
    if (!participant?.admin) return await reply("❌ Only group admins can use this command.");

    let userJid;
    if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        // If user is mentioned
        userJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else if (quoted?.sender) {
        // If replying to a message
        userJid = quoted.sender;
    } else if (args && args.match(/^\d+$/)) {
        // If phone number is provided
        userJid = args + '@s.whatsapp.net';
    } else {
        return await reply("❌ Please reply to a message, mention a user, or provide a phone number.");
    }

    // Validate the JID
    if (!userJid.includes('@s.whatsapp.net')) {
        userJid = userJid.replace('@', '') + '@s.whatsapp.net';
    }

    try {
        // Remove the participant
        await Void.groupParticipantsUpdate(from, [userJid], 'remove');
        
        // Get the user's number without @s.whatsapp.net
        const userNumber = userJid.split('@')[0];
        
        // Send success message with mention
        await Void.sendMessage(from, {
            image: { url: `https://files.catbox.moe/4j07ae.jpg` },
            caption: `✅ Successfully removed @${userNumber}\n\n- Action by admin`,
            mentions: [userJid]
        }, { quoted: msg });
        
    } catch (error) {
        console.error("Remove command error:", error);
        await reply(`❌ Failed to remove the member. Error: ${error.message}`);
    }
});
