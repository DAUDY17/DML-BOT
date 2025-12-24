const { cmd } = require('../command');
const { sleep } = require('../lib/functions');

cmd({
    pattern: "restart",
    desc: "Restart the bot NOVA-XMD",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, senderNumber, reply
}) => {
    try {
        // Get the bot owner's number dynamically from conn.user.id
        const botOwner = conn.user.id.split(":")[0]; // Extract the bot owner's number
        if (senderNumber !== botOwner) {
            return reply("⚠️ Only the bot owner can use this command.");
        }

        const { exec } = require("child_process");
        
        // Send initial message
        await reply("🔄 Restarting NOVA-XMD AI bot... Please wait...");
        await sleep(1500);
        
        // Send confirmation message
        await reply("✅ Restart command received. Bot will restart now!");
        
        // Execute restart command
        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
                console.error(`Error during restart: ${error}`);
                // Send error message if restart fails
                reply(`❌ Restart failed: ${error.message}`);
                return;
            }
            console.log(`Restart successful: ${stdout}`);
        });
    } catch (e) {
        console.error(e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
