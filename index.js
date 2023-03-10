
"use strict";
const { BufferJSON, WA_DEFAULT_EPHEMERAL, proto, prepareWAMessageMedia, areJidsSameUser, getContentType } = require('@adiwajshing/baileys')
const { downloadContentFromMessage, generateWAMessage, generateWAMessageFromContent, MessageType, buttonsMessage } = require("@adiwajshing/baileys")
const { exec, spawn } = require("child_process");
const { color, bgcolor, pickRandom, randomNomor } = require('./function/console.js')

// apinya
const fs = require("fs");
const ms = require("ms");
const chalk = require('chalk');
const axios = require("axios");
const colors = require('colors/safe');
const ffmpeg = require("fluent-ffmpeg");
const moment = require("moment-timezone");

// Database
const setting = JSON.parse(fs.readFileSync('./setting.json'));
const antilink = JSON.parse(fs.readFileSync('./database/antilink.json'));
const mess = JSON.parse(fs.readFileSync('./mess.json'));
const db_error = JSON.parse(fs.readFileSync('./database/error.json'));
const db_user = JSON.parse(fs.readFileSync('./database/pengguna.json'));
const db_respon_list = JSON.parse(fs.readFileSync('./database/list.json'));

moment.tz.setDefault("Asia/Jakarta").locale("id");
module.exports = async(conn, msg, m, setting, store) => {
try {
let { ownerNumber, botName } = setting
const { type, quotedMsg, mentioned, now, fromMe, isBaileys } = msg
if (msg.isBaileys) return
const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
const tanggal = moment().tz("Asia/Jakarta").format("ll")
let dt = moment(Date.now()).tz('Asia/Jakarta').locale('id').format('a')
const ucapanWaktu = "Selamat "+dt.charAt(0).toUpperCase() + dt.slice(1)
const content = JSON.stringify(msg.message)
const from = msg.key.remoteJid
const time = moment(new Date()).format("HH:mm");
var chats = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type === 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type === 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type === 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : (type === 'buttonsResponseMessage') && quotedMsg.fromMe && msg.message.buttonsResponseMessage.selectedButtonId ? msg.message.buttonsResponseMessage.selectedButtonId : (type === 'templateButtonReplyMessage') && quotedMsg.fromMe && msg.message.templateButtonReplyMessage.selectedId ? msg.message.templateButtonReplyMessage.selectedId : (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : (type == 'listResponseMessage') && quotedMsg.fromMe && msg.message.listResponseMessage.singleSelectReply.selectedRowId ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ""
if (chats == undefined) { chats = '' }
const prefix = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/.test(chats) ? chats.match(/^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^&.+-,\/\\©^]/gi) : '#'
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const isOwner = [`${setting.ownerNumber}`,"6283834558105@s.whatsapp.net","6282279915237@s.whatsapp.net"].includes(sender) ? true : false
const pushname = msg.pushName
const body = chats.startsWith(prefix) ? chats : ''
const args = body.trim().split(/ +/).slice(1);
const q = args.join(" ");
const isCommand = body.startsWith(prefix);
const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
const isCmd = isCommand ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'

// Group
const groupMetadata = isGroup ? await conn.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupId = isGroup ? groupMetadata.id : ''
const participants = isGroup ? await groupMetadata.participants : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
const isGroupAdmins = groupAdmins.includes(sender)
const isAntiLink = antilink.includes(from) ? true : false

// Quoted
const quoted = msg.quoted ? msg.quoted : msg
const isImage = (type == 'imageMessage')
const isQuotedMsg = (type == 'extendedTextMessage')
const isMedia = (type === 'imageMessage' || type === 'videoMessage');
const isQuotedImage = isQuotedMsg ? content.includes('imageMessage') ? true : false : false
const isVideo = (type == 'videoMessage')
const isQuotedVideo = isQuotedMsg ? content.includes('videoMessage') ? true : false : false
const isSticker = (type == 'stickerMessage')
const isQuotedSticker = isQuotedMsg ? content.includes('stickerMessage') ? true : false : false 
const isQuotedAudio = isQuotedMsg ? content.includes('audioMessage') ? true : false : false
var dataGroup = (type === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : ''
var dataPrivate = (type === "messageContextInfo") ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isButton = dataGroup.length !== 0 ? dataGroup : dataPrivate
var dataListG = (type === "listResponseMessage") ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : ''
var dataList = (type === 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply.selectedRowId) : ''
const isListMessage = dataListG.length !== 0 ? dataListG : dataList

function mentions(teks, mems = [], id) {
if (id == null || id == undefined || id == false) {
let res = conn.sendMessage(from, { text: teks, mentions: mems })
return res
} else {
let res = conn.sendMessage(from, { text: teks, mentions: mems }, { quoted: msg })
return res
}
}

const mentionByTag = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.mentionedJid : []
const mentionByReply = type == "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.participant || "" : ""
const mention = typeof(mentionByTag) == 'string' ? [mentionByTag] : mentionByTag
mention != undefined ? mention.push(mentionByReply) : []
const mentionUser = mention != undefined ? mention.filter(n => n) : []



const reply = (teks) => {conn.sendMessage(from, { text: teks }, { quoted: msg })}

//Antilink
if (isGroup && isAntiLink && isBotGroupAdmins){
if (chats.match(/(https:\/\/chat.whatsapp.com)/gi)) {
if (!isBotGroupAdmins) return reply('Untung gw bukan admin')
if (isOwner) return reply('Untung lu owner ku:v😙')
if (isGroupAdmins) return reply('Admin grup mah bebas ygy🤭')
if (fromMe) return reply('Gw bebas share link')
await conn.sendMessage(from, { delete: msg.key })
reply(`*「 GROUP LINK DETECTOR 」*\n\nTerdeteksi mengirim link group,Maaf sepertinya kamu akan di kick`)
conn.groupParticipantsUpdate(from, [sender], "remove")
}
}

const sendContact = (jid, numbers, name, quoted, mn) => {
let number = numbers.replace(/[^0-9]/g, '')
const vcard = 'BEGIN:VCARD\n' 
+ 'VERSION:3.0\n' 
+ 'FN:' + name + '\n'
+ 'ORG:;\n'
+ 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n'
+ 'END:VCARD'
return conn.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] }, mentions : mn ? mn : []},{ quoted: quoted })
}

let cekUser = (satu, dua) => { 
let x1 = false
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){x1 = i}})
if (x1 !== false) {
if (satu == "id"){ return db_user[x1].id }
if (satu == "name"){ return db_user[x1].name }
if (satu == "seri"){ return db_user[x1].seri }
if (satu == "premium"){ return db_user[x1].premium }
}
if (x1 == false) { return null } 
}

let setUser = (satu, dua, tiga) => { 
Object.keys(db_user).forEach((i) => {
if (db_user[i].id == dua){
if (satu == "±id"){ db_user[i].id = tiga
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±name"){ db_user[i].name = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±seri"){ db_user[i].seri = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
if (satu == "±premium"){ db_user[i].premium = tiga 
fs.writeFileSync('./database/pengguna.json', JSON.stringify(db_user))} 
}})
}





// Console
if (isGroup && isCmd) {
console.log(colors.green.bold("[Group]") + " " + colors.brightCyan(time,) + " " + colors.black.bgYellow(command) + " " + colors.green("from") + " " + colors.blue(groupName));
}

if (!isGroup && isCmd) {
console.log(colors.green.bold("[Private]") + " " + colors.brightCyan(time,) + " " + colors.black.bgYellow(command) + " " + colors.green("from") + " " + colors.blue(pushname));
}

// Casenya
switch(command) {
case 'menu':
case 'help':
case 'list':{
if (isGroup) return 
const mark_slebew = '0@s.whatsapp.net'
const more = String.fromCharCode(8206)
const strip_ny = more.repeat(4001)
var footer_nya =`Creator by - ${setting.ownerName}`
let tampilan_nya = `Hallo ${pushname? pushname: 'Kak'} ${ucapanWaktu}
Saya ${botName}

*- INFO BOT -*
Owner: Zennn
Nomor: @${ownerNumber.split('@')[0]}
Waktu: ${jam}
Tanggal: ${tanggal}`
conn.sendMessage(from,
{text: tampilan_nya,
buttonText: "List Produk",
sections: [{title: "━━━━━━━━━━━━[ 𝗦𝗢𝗖𝗜𝗔𝗟 𝗠𝗘𝗗𝗜𝗔 ]━━━━━━━━━━━━",
rows: [
{title: "» YUOTUBE", rowId: prefix+"yt", description: "YouTube Admin"},
{title: "» GROUP", rowId: prefix+"gc", description: "Group Admin"},
{title: "» INSTAGRAM", rowId: prefix+"ig", description: "Instagram Admin"},
{title: "» COMMITS", rowId: prefix+"thanksto", description: "Siapa Saja Yang Berkontribusi Di Dalam sistem Ini"}]},
{title: "━━━━━━━━━━━━[ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 ]━━━━━━━━━━━━",
rows: [
{title: "» LIST CMD", rowId: prefix+"listcmd", description: "Donasi Kepada Bot"}]},
{title: "━━━━━━━━━━━━[ 𝗣𝗔𝗬 ]━━━━━━━━━━━━",
rows: [
{title: "» DONASI", rowId: prefix+"donasi", description: "Donasi Kepada Bot"}]},
{title: "» PAYMENT", rowId: prefix+"pay", description: "Donasi Kepada Bot"}]},
{title: "━━━━━━━━━━━━[ 𝗦𝗘𝗪𝗔 𝗕𝗢𝗧 ]━━━━━━━━━━━━",
rows: [
{title: "» SEWA", rowId: prefix+"sewabot", description: "Sewa bot Tanpa batas waktu"}]},
{title: "━━━━━━━━━━━━[ 𝗝𝗔𝗦𝗔 ]━━━━━━━━━━━━",
rows: [
{title: "» MURID BOT", rowId: prefix+"pengajaran", description: "Di bantu untuk membuat bot dari 0/100%"}]},
{title: "━━━━━━━━━━━━[ 𝗠𝗘𝗡𝗝𝗨𝗔𝗟 ]━━━━━━━━━━━━",
rows: [
{title: "» SCRIPT BOT", rowId: prefix+"scbot", description: "Script bot Md"},
],
footer: footer_nya,
mentions:[setting.ownerNumber, sender]})
}
break
case 'thanksto':
if (isGroup) return 
	conn.sendMessage(from, {text: `*⫍ THANKS TO ⫎*
   •Allah Swt
   •Ortu
   •Ramaa gnnz *[Creator]*`},
{quoted: msg})
break
case 'listcmd':
if (isGroup) return 
const more = String.fromCharCode(8206)
const strip_ny = more.repeat(4001)
let rama = `
Hallo ${pushname? pushname: 'Kak'} ${ucapanWaktu}
Saya ${botName}

*- INFO BOT -*
Owner: Zennn
Nomor: @${ownerNumber.split('@')[0]}
Waktu: ${jam}
Tanggal: ${tanggal}
${strip_nya}

❒ *STORE MENU*
- ${prefix}pay
- ${prefix}sewa
- ${prefix}murbot
- ${prefix}sc

❒ *GROUP ONLY*
- ${prefix}hidetag
- ${prefix}kick 
- ${prefix}antilink
- ${prefix}group _(open/close)_
`
let btn_menu = [
{buttonId: `${prefix}yt`, buttonText: { displayText: 'YOUTUBE' }, type: 1 },
{buttonId: `${prefix}ig`, buttonText: { displayText: 'INSTAGRAM' }, type: 1 },
{buttonId: `${prefix}gc`, buttonText: { displayText: 'GROUP' }, type: 1 },
]
conn.sendMessage(from, {text: rama, buttons: btn_menu}, {quoted: msg})
break
case 'yt':
case 'youtube':
if (isGroup) return 
	conn.sendMessage(from, {text: `*- YOUTUBE -*\n\nSubscribe My YouTube\nhttps://www.youtube.com/@telnyxbot`},
{quoted: msg})
break
case 'ig':
case 'instagram':
if (isGroup) return 
	conn.sendMessage(from, {text: `*- INSTAGRAM -*\n\nFollow My Insta\nhttps://instagram.com/zennjss?igshid=ZDdkNTZiNTM=`},
{quoted: msg})
break
case 'gc':
case 'group':
case 'grup':
case 'groupadmin':
if (isGroup) return 
	conn.sendMessage(from, {text: `*- GROUP CHAT WA -*\n\nPlease Join My Group\nhttps://chat.whatsapp.com/LnJbKcJstNhAk8duUApCsQ`},
{quoted: msg})
break
case 'donasi': case 'donate':{
	if (isGroup) return 
let tekssss = `───「  *DONASI*  」────

*Payment donasi💰* 

- *Dana :* 085298256587
- *Saweria :* https://saweria.co/zennjss

berapapun donasi dari kalian itu sangat berarti bagi kami 
`
conn.sendMessage(from, { image: fs.readFileSync(`./gambar/qris.jpg`),
 caption: tekssss, 
footer: `${setting.ownerName} © 2022`},
{quoted: msg})
}
break
case 'payment':
case 'pembayaran':
case 'bayar':{
	if (isGroup) return 
let tekssss = `───「  *PAYMENT*  」────

- *Dana :* 085298256587

E-Pay pembayaran *Telnyx - Store*
`
conn.sendMessage(from, { image: fs.readFileSync(`./gambar/qris.jpg`),
 caption: tekssss, 
footer: `${setting.ownerName} © 2022`},
{quoted: msg})
}
break
case 'swa':
case 'sewa':
case 'sewabot':{
	if (isGroup) return 
let teq =`*SEWA BOT*

*List Harga*
Rp10.000 › Unlimited-day

*day › hari*

*Keuntungan Sewabot*
- _Bisa Add Bot 1 Group_
- _Bisa Gunain Fitur Admin_

Minat Sewabot?
Pencet button Di bawah`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: '- BUY -' }, type: 1 },
]
conn.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'openmurid':
case 'murbot':
case 'pengajaranpembuatanbot':
case 'pengajaran':
case 'pengajaranbot':{
	if (isGroup) return 
let teq =`*OPEN MURID PEMBUATANAN BOT WHATSAPP*

\`\`\`KALIAN BISA OPEN SEWA BOT.., (JADI BALIK MODAL)\`\`\`

---------------------------------------------------
PEMBERITAHUAN : 

Pengajaran Termux & Panel
Function Fitur
Buat Fitur sederhana
Buat Fitur Tingkat menengah ( download )

Order = Faham
Jika setuju untuk membeli
Klik button di bawah!!`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: 'BUY🛒' }, type: 1 },
]
conn.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break
case 'sc':
case 'script':
case 'scbot':
case 'scriptbot':{
	if (isGroup) return 
let teq =`*- SCRIPT BOT MD -*

- Script Ini di jual Dengan harga yang Cukup Murah
Kalian bisa membelinya
Dengan Harga *Rp 20.000* 

*Jika setuju untuk membeli*
Klik button di bawah!!`
let btn_menu = [
{buttonId: `${prefix}proses`, buttonText: { displayText: '- BUY -' }, type: 1 },
]
conn.sendMessage(from,
{text: teq,
buttons: btn_menu},
{quoted: msg})
}
break

case 'proses':{
let tek = (`「 *TRANSAKSI PENDING* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Pending\`\`\`\n\n*--------------------------*\n\n*Pesanan ini akan diproses manual oleh admin,*\n*Tunggu admin memprosesnya🙏*`)
let btn_menu = [
{buttonId: `${prefix}aokeguwgw`, buttonText: { displayText: 'OKE SAYA TUNGGU👍' }, type: 1 },
]
conn.sendMessage(from,
{text: tek,
buttons: btn_menu})
conn.sendMessage(`${setting.ownerNumber}`, {text: `*- ORDER -*\n\nOrder Pending...\nNama: ${pushname}\nWaktu: ${jam}\nTanggal: ${tanggal}\n\nNomor:\n\nwa.me/${sender.split('@')[0]}`})
}
break
case 'done':{
	if (!fromMe) return reply('Ngapain..?')
let tek = (`「 *TRANSAKSI BERHASIL* 」\n\n\`\`\`📆 TANGGAL : ${tanggal}\n⌚ JAM     : ${jam}\n✨ STATUS  : Berhasil\`\`\`\n\nTerimakasih Telah order di *Telnyx - Store*\nNext Order ya...`)
let btn_menu = [
{buttonId: `${prefix}aokeguwgw`, buttonText: { displayText: 'OKE THENKS👍' }, type: 1 },
]
conn.sendMessage(from,
{text: tek,
buttons: btn_menu})
}
break
case 'hidetag':
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('Nagapain banv?')
let mem = [];
groupMembers.map( i => mem.push(i.id) )
conn.sendMessage(from, { text: q ? q : '', mentions: mem })
break
case 'antilink':{
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('Ngapain deck?')
if (!args[0]) return reply(`Kirim perintah #${command} _options_\nOptions : on & off\nContoh : #${command} on`)
if (args[0] == 'ON' || args[0] == 'on' || args[0] == 'On') {
if (isAntiLink) return reply('Antilink sudah aktif')
antilink.push(from)
fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
reply('Successfully Activate Antilink In This Group')
} else if (args[0] == 'OFF' || args[0] == 'OF' || args[0] == 'Of' || args[0] == 'Off' || args[0] == 'of' || args[0] == 'off') {
if (!isAntiLink) return reply('Antilink belum aktif')
let anu = antilink.indexOf(from)
antilink.splice(anu, 1)
fs.writeFileSync('./database/antilink.json', JSON.stringify(antilink, null, 2))
reply('Successfully Disabling Antilink In This Group')
} else { reply('Kata kunci tidak ditemukan!') }
}
break
case 'group':
case 'grup':
if (!isGroup) return reply(mess.OnlyGrup)
if (!fromMe) return reply('ngapain?')
if (!q) return reply(`Kirim perintah #${command} _options_\nOptions : close & open\nContoh : #${command} close`)
if (args[0] == "close") {
conn.groupSettingUpdate(from, 'announcement')
reply(`Sukses mengizinkan hanya admin yang dapat mengirim pesan ke grup ini`)
} else if (args[0] == "open") {
conn.groupSettingUpdate(from, 'not_announcement')
reply(`Sukses mengizinkan semua peserta dapat mengirim pesan ke grup ini`)
} else {
reply(`Kirim perintah #${command} _options_\nOptions : close & open\nContoh : #${command} close`)
}
break
case 'kick':
if (!isGroup) return reply(mess.OnlyGroup)
if (!fromMe) return reply('ngapainn?')
var number;
if (mentionUser.length !== 0) {
number = mentionUser[0]
conn.groupParticipantsUpdate(from, [number], "remove")
.then( res => 
reply(`*Sukses mengeluarkan member..!*`))
.catch((err) => reply(mess.error.api))
} else if (isQuotedMsg) {
number = quotedMsg.sender
conn.groupParticipantsUpdate(from, [number], "remove")
.then( res => 
reply(`*Sukses mengeluarkan member..!*`))
.catch((err) => reply(mess.error.api))
} else {
reply(`Tag atau balas pesan orang yang ingin dikeluarkan dari grup`)
}
break
default:


}} catch (err) {
console.log(color('[ERROR]', 'red'), err)
const isGroup = msg.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? (msg.key.participant ? msg.key.participant : msg.participant) : msg.key.remoteJid
const moment = require("moment-timezone");
const jam = moment.tz('asia/jakarta').format('HH:mm:ss')
const tanggal = moment().tz("Asia/Jakarta").format("ll")
let kon_erorr = {"tanggal": tanggal, "jam": jam, "error": err, "user": sender}
db_error.push(kon_erorr)
fs.writeFileSync('./database/error.json', JSON.stringify(db_error))
var errny =`*SERVER ERROR*
*Dari:* @${sender.split("@")[0]}
*Jam:* ${jam}
*Tanggal:* ${tanggal}
*Tercatat:* ${db_error.length}
*Type:*
${err}`
conn.sendMessage(setting.ownerNumber, {text:errny, mentions:[sender]})
}}