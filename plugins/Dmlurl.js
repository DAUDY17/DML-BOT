const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { cmd } = require("../command");

cmd({
  pattern: "url",
  alias: ["imgtourl", "imgurl", "tourl", "geturl", "upload"],
  react: "🖇",
  desc: "Convert media to Catbox URL",
  category: "utility",
  use: ".tourl [reply to media]",
  filename: __filename
}, async (client, message, args, { reply }) => {

  let tempFilePath;

  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || "";

    if (!mimeType) {
      throw "❌ Please reply to an image, video, or audio file.";
    }

    const mediaBuffer = await quotedMsg.download();
    tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Detect extension
    let extension = ".bin";
    if (mimeType.includes("jpeg")) extension = ".jpg";
    else if (mimeType.includes("png")) extension = ".png";
    else if (mimeType.includes("webp")) extension = ".webp";
    else if (mimeType.includes("gif")) extension = ".gif";
    else if (mimeType.includes("video")) extension = ".mp4";
    else if (mimeType.includes("audio")) extension = ".mp3";

    const fileName = `file${extension}`;
    const form = new FormData();
    form.append("fileToUpload", fs.createReadStream(tempFilePath), fileName);
    form.append("reqtype", "fileupload");

    const response = await axios.post(
      "https://catbox.moe/user/api.php",
      form,
      { headers: form.getHeaders() }
    );

    if (!response.data || !response.data.startsWith("https://")) {
      throw "Upload failed. Invalid Catbox response.";
    }

    // ===============================
    // RANDOM IMAGE LOGIC (WORKING)
    // ===============================
    let imageUrl = "https://files.catbox.moe/reypkp.jpg"; // fallback

    try {
      const scsFolder = path.join(__dirname, "../Dml");
      const images = fs
        .readdirSync(scsFolder)
        .filter(f => /^menu\d+\.jpg$/i.test(f));

      if (images.length > 0) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        imageUrl = path.join(scsFolder, randomImage);
      }
    } catch (err) {
      console.log("Random image error:", err.message);
    }

    const mediaUrl = response.data;

    let mediaType = "File";
    if (mimeType.includes("image")) mediaType = "Image";
    else if (mimeType.includes("video")) mediaType = "Video";
    else if (mimeType.includes("audio")) mediaType = "Audio";

    const caption =
`╭───〔 FILE UPLOADED 〕───╮
│ 📁 Type : ${mediaType}
│ 📦 Size : ${formatBytes(mediaBuffer.length)}
│ 🌐 URL  :
│ ${mediaUrl}
╰────────────────────────╯
> Uploaded by Dml`;

    // ===============================
    // SEND IMAGE + CAPTION + CONTEXT
    // ===============================
    await client.sendMessage(message.chat, {
      image: { url: imageUrl },
      caption: caption,
      contextInfo: {
        mentionedJid: [message.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363403958418756@newsletter",
          newsletterName: "DML-URL",
          serverMessageId: 143
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    await reply(`❌ Error: ${error.message || error}`);
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});

// ===============================
// FORMAT BYTES
// ===============================
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
}
