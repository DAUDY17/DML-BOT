const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");
const path = require("path");

const recentCallers = new Set();

/* ===============================
   ANTI-CALL EVENT (GLOBAL)
================================ */
cmd({ on: "ready" }, async (client) => {
    client.ev.on("call", async (callData) => {
        if (!config.ANTI_CALL) return;

        for (const call of callData) {
            if (call.status === "offer" && !call.isGroup) {
                await client.rejectCall(call.id, call.from);

                if (!recentCallers.has(call.from)) {
                    recentCallers.add(call.from);

                    await client.sendMessage(call.from, {
                        text: "_📞 Auto Reject Call Mode Activated ☠️ No Calls Allowed_*"
                    });

                    setTimeout(() => recentCallers.delete(call.from), 600000);
                }
            }
        }
    });
});

/* ===============================
   ANTI-CALL COMMAND
================================ */
cmd({
    pattern: "anticall",
    alias: ["callblock", "togglecall"],
    desc: "Toggle call blocking feature",
    category: "owner",
    react: "📞",
    filename: __filename,
    fromMe: true
},
async (client, message, m, { isOwner, from, sender, args }) => {
    try {
        // OWNER CHECK
        if (!isOwner) {
            return client.sendMessage(from, {
                text: "🚫 Owner-only command",
                mentions: [sender]
            }, { quoted: message });
        }

        /* ===============================
           RANDOM IMAGE
        ================================ */
        const scsFolder = path.join(__dirname, "../Dml");
        const images = fs.existsSync(scsFolder)
            ? fs.readdirSync(scsFolder).filter(f => /^menu\d+\.jpg$/i.test(f))
            : [];

        let imagePath = images.length
            ? path.join(scsFolder, images[Math.floor(Math.random() * images.length)])
            : null;

        /* ===============================
           ACTION
        ================================ */
        const action = args[0]?.toLowerCase() || "status";
        let statusText = "";
        let reaction = "📞";
        let extra = "";

        switch (action) {
            case "on":
                if (config.ANTI_CALL) {
                    statusText = "ℹ️ Anti-call is already *ENABLED*";
                    reaction = "ℹ️";
                } else {
                    config.ANTI_CALL = true;
                    statusText = "✅ Anti-call has been *ENABLED*";
                    reaction = "✅";
                    extra = "Incoming calls will be auto-rejected 🔇";
                }
                break;

            case "off":
                if (!config.ANTI_CALL) {
                    statusText = "ℹ️ Anti-call is already *DISABLED*";
                    reaction = "ℹ️";
                } else {
                    config.ANTI_CALL = false;
                    statusText = "❌ Anti-call has been *DISABLED*";
                    reaction = "❌";
                    extra = "Calls are now allowed 📞";
                }
                break;

            default:
                statusText = `📊 Anti-call Status:\n${
                    config.ANTI_CALL ? "✅ ENABLED" : "❌ DISABLED"
                }`;
                reaction = "📊";
                extra = config.ANTI_CALL
                    ? "Calls are currently blocked"
                    : "Calls are allowed";
                break;
        }

        /* ===============================
           SEND MESSAGE
        ================================ */
        const payload = imagePath
            ? {
                image: { url: imagePath },
                caption: `${statusText}\n\n${extra}\n\nDML-ANTICALL`
            }
            : {
                text: `${statusText}\n\n${extra}\n\nDML-ANTICALL`
            };

        await client.sendMessage(from, payload, { quoted: message });

        /* ===============================
           REACT
        ================================ */
        await client.sendMessage(from, {
            react: { text: reaction, key: message.key }
        });

    } catch (error) {
        console.error("Anti-call error:", error);
        await client.sendMessage(from, {
            text: `⚠️ Error: ${error.message}`,
            mentions: [sender]
        }, { quoted: message });
    }
});
