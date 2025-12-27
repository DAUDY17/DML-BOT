const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const config = require('../config');    
const { cmd } = require('../command');

cmd({
    pattern: "repo",
    alias: ["sc", "script", "info"],
    desc: "Fetch information about a GitHub repository.",
    react: "📂",
    category: "info",
    filename: __filename,
},
async (conn, mek, m, { from, reply }) => {

    const githubRepoURL = 'https://github.com/MLILA17/DML-MD';

    try {
        // Extract username and repo name
        const [, username, repoName] =
            githubRepoURL.match(/github\.com\/([^/]+)\/([^/]+)/);

        // Fetch repo data
        const response = await fetch(
            `https://api.github.com/repos/${username}/${repoName}`
        );

        if (!response.ok) {
            throw new Error(`GitHub API request failed: ${response.status}`);
        }

        const repoData = await response.json();

        // Format message
        const formattedInfo = `*BOT NAME:*
> ${repoData.name}

*OWNER NAME:*
> ${repoData.owner.login}

*STARS:*
> ${repoData.stargazers_count}

*FORKS:*
> ${repoData.forks_count}

*GITHUB LINK:*
> ${repoData.html_url}

*DESCRIPTION:*
> ${repoData.description || 'No description'}

*Don't Forget To Star and Fork Repository*

> *© Powered By Dml 🇹🇿*`;

        // ===============================
        // RANDOM IMAGE LOGIC
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

        // Send image + caption
        await conn.sendMessage(from, {
            image: { url: imageUrl },
            caption: formattedInfo,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363403958418756@newsletter',
                    newsletterName: 'DML-REPO',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in repo command:", error);
        reply(
            "Sorry, something went wrong while fetching the repository information. Please try again later."
        );
    }
});
