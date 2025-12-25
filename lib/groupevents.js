// Give Me Credit If Using This File Give Me Credit On Your Channel ✅
// Credits Dev DML - DML-XMD

const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../config');

/* ───── CONTEXT INFO ───── */
const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363403958418756@newsletter',
            newsletterName: 'DML-GROUP',
            serverMessageId: 143,
        },
    };
};

/* ───── FALLBACK PROFILE PICTURES ───── */
const ppUrls = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

/* ───── GET SPECIFIC USER PROFILE PICTURE ───── */
const getUserPP = async (conn, jid) => {
    try {
        return await conn.profilePictureUrl(jid, 'image');
    } catch {
        return ppUrls[Math.floor(Math.random() * ppUrls.length)];
    }
};

/* ───── GROUP EVENTS ───── */
const GroupEvents = async (conn, update) => {
    try {
        if (!isJidGroup(update.id)) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants || [];
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;
        const timestamp = new Date().toLocaleString();

        for (const num of participants) {
            const userName = num.split("@")[0];
            const ppUrl = await getUserPP(conn, num);

            /* ───── MEMBER ADDED ───── */
            if (update.action === "add" && config.WELCOME === "true") {

                const WelcomeText = `╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮
┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @${userName} 👋
┃𝙳𝙴𝚅: DML
┃𝙽𝚄𝙼𝙱𝙴𝚁: #${groupMembersCount}
┃𝚃𝙸𝙼𝙴: ${timestamp} ⏰
╰━━━━━━━━━━━━━━━╯

*DML*
${desc}

> *POWERED BY DML*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });
            }

            /* ───── MEMBER REMOVED ───── */
            else if (update.action === "remove" && config.WELCOME === "true") {

                const GoodbyeText = `╭╼━≪•𝙼𝙴𝙼𝙱𝙴𝚁 𝙻𝙴𝙵𝚃•≫━╾╮
┃𝙶𝙾𝙾𝙳𝙱𝚈𝙴: @${userName} 👋
┃𝙳𝙴𝚅: DML
┃𝙽𝚄𝙼𝙱𝙴𝚁: #${groupMembersCount}
┃𝚃𝙸𝙼𝙴: ${timestamp} ⏰
╰━━━━━━━━━━━━━━━━╯

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ DML*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });
            }

            /* ───── ADMIN DEMOTED ───── */
            else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];

                await conn.sendMessage(update.id, {
                    text: `╭╼ DML-CALLED ╾╮
┃@${demoter} 𝙷𝙰𝚂 𝙳𝙴𝙼𝙾𝚃𝙴𝙳 @${userName} 𝙵𝚁𝙾𝙼 𝙰𝙳𝙼𝙸𝙽
┃⏰ 𝚃𝙸𝙼𝙴: ${timestamp}
┃👥 𝙶𝚁𝙾𝚄𝙿: ${metadata.subject}
╰─────────────────╯

> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴇᴠ DML*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }

            /* ───── ADMIN PROMOTED ───── */
            else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];

                await conn.sendMessage(update.id, {
                    text: `╭╼ DML-APPOINT╾╮
┃@${promoter} 𝙷𝙰𝚂 𝙿𝚁𝙾𝙼𝙾𝚃𝙴𝙳 @${userName} 𝚃𝙾 𝙰𝙳𝙼𝙸𝙽
┃⏰ 𝚃𝙸𝙼𝙴: ${timestamp}
┃👥 𝙶𝚁𝙾𝚄𝙿: ${metadata.subject}
╰─────────────────╯

> *POWERED BY DML*`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;