

// Import Module
require('./len')
require('./database/Menu/LenwyMenu')
const fs = require('fs');
const axios = require('axios');

// Import Scrape
const Ai4Chat = require('./scrape/Ai4Chat');
const tiktok2 = require('./scrape/Tiktok');

const listCmdPath = './database/listcmd.json'; 
let listCmd = {};

try {
    listCmd = JSON.parse(fs.readFileSync(listCmdPath, 'utf8'));
} catch (e) {
    console.error('Error loading cmdpath database :', e.message)
}

const saveListCmd = () => {
    fs.writeFileSync(listCmdPath, JSON.stringify(listCmd, null, 2));
}

module.exports = async (lenwy, m) => {
    const msg = m.messages[0];
    if (!msg.message) return;

    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.remoteJid;
    const pushname = msg.pushName || "Swift";
    const args = body.slice(1).trim().split(" ");
    const command = args.shift().toLowerCase();
    const q = args.join(" ");

    if (!body.startsWith(prefix)) return;

    // DEFINISI UTILITY DIATAS
    const lenwyreply = (teks) => lenwy.sendMessage(sender, { text: teks }, { quoted: msg });
    const isGroup = sender.endsWith('@g.us');
    const isAdmin = (admin.includes(sender))
    const menuImage = fs.readFileSync(image);

    const dynamicResponse = listCmd[command];
    if (dynamicResponse) {
        return lenwyreply(dynamicResponse);
    }

switch (command) {

// Menu
case "menu": {
    await lenwy.sendMessage(sender,
        {
            image: menuImage,
            caption: lenwymenu,
            mentions: [sender]
        },
    { quoted: msg }
    )
}
break

case "addlist" : {
    if (!isAdmin) return lenwyreply(mess.admin); 

    const cmdName = args.shift()?.toLowerCase();
    const responseText = args.join(" ");

    if (!cmdName || !responseText) { 
        return lenwyreply("⚠️ *Format Salah:*\n!addlist [nama_perintah] [respons]\n\nContoh: !addlist *ml* tulis disini list harga ML!");
    }

    if (["menu", "admin", "group", "ai", "ttdl", "ig", "tebakangka", "tebak", "quote", "addlist", "dellist"].includes(cmdName)) {
        return lenwyreply("❌ *Gagal:* Perintah ini sudah ada di kode utama dan tidak bisa ditimpa.");
    }

    listCmd[cmdName] = responseText;
    saveListCmd();

    lenwyreply(`✅ *Sukses:* Perintah *!${cmdName}* berhasil ditambahkan!\n\n*Respons:* ${responseText}`);
}
break

case "dellist": {
    // Hanya Admin yang bisa menghapus list
    if (!isAdmin) return lenwyreply(mess.admin);

    const cmdName = q.toLowerCase();
    if (!cmdName) {
        return lenwyreply("⚠️ *Format Salah:*\n!dellist [nama_perintah]");
    }

    if (listCmd[cmdName]) {
        delete listCmd[cmdName];
        saveListCmd();
        lenwyreply(`✅ *Sukses:* Perintah *!${cmdName}* berhasil dihapus.`);
    } else {
        lenwyreply(`❌ *Gagal:* Perintah *!${cmdName}* tidak ditemukan dalam daftar.`);
    }
}
break

// Hanya Admin
case "admin": {
    if (!isAdmin) return lenwyreply(mess.admin); // COntoh Penerapan Hanya Admin
    lenwyreply("🎁 *Kamu Adalah Admin*"); // Admin Akan Menerima Pesan Ini
}
break

// Hanya Group
case "group": {
    if (!isGroup) return lenwyreply(mess.group); // Contoh Penerapan Hanya Group
    lenwyreply("🎁 *Kamu Sedang Berada Di Dalam Grup*"); // Pesan Ini Hanya Akan Dikirim Jika Di Dalam Grup
}
break

// AI Chat
case "ai": {
    if (!q) return lenwyreply("☘️ *Contoh:* !ai Apa itu JavaScript?");
        lenwyreply(mess.wait);
    try {
        const lenai = await Ai4Chat(q);
            await lenwyreply(`*Swift AI*\n\n${lenai}`);
                } catch (error) {
            console.error("Error:", error);
        lenwyreply(mess.error);
    }
}
break;

case "ttdl": {
    if (!q) return lenwyreply("⚠ *Mana Link Tiktoknya?*");
        lenwyreply(mess.wait);
    try {
        const result = await tiktok2(q); // Panggil Fungsi Scraper

            // Kirim Video
            await lenwy.sendMessage(
                sender,
                    {
                        video: { url: result.no_watermark },
                        caption: `*🎁 Swift Tiktok Downloader*`
                    },
                { quoted: msg }
            );

        } catch (error) {
            console.error("Error TikTok DL:", error);
        lenwyreply(mess.error);
    }
}
break;

case "ig": {
    if (!q) return lenwyreply("⚠ *Mana Link Instagramnya?*");
    try {
        lenwyreply(mess.wait);

        // Panggil API Velyn
        const apiUrl = `https://www.velyn.biz.id/api/downloader/instagram?url=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.data.url[0]) {
            throw new Error("Link tidak valid atau API error");
        }

        const data = response.data.data;
        const mediaUrl = data.url[0];
        const metadata = data.metadata;

        // Kirim Media
        if (metadata.isVideo) {
            await lenwy.sendMessage(
                sender,
                    {
                        video: { url: mediaUrl },
                        caption: `*Instagram Reel*\n\n` +
                            `*Username :* ${metadata.username}\n` +
                            `*Likes :* ${metadata.like.toLocaleString()}\n` +
                            `*Comments :* ${metadata.comment.toLocaleString()}\n\n` +
                            `*Caption :* ${metadata.caption || '-'}\n\n` +
                            `*Source :* ${q}`
                    },
                    { quoted: msg }
                );
        } else {
            await lenwy.sendMessage(
                sender,
                    {
                        image: { url: mediaUrl },
                        caption: `*Instagram Post*\n\n` +
                            `*Username :* ${metadata.username}\n` +
                            `*Likes :* ${metadata.like.toLocaleString()}\n\n` +
                            `*Caption :* ${metadata.caption || '-'}`
                    },
                    { quoted: msg }
                );
            }

        } catch (error) {
            console.error("Error Instagram DL:", error);
        lenwyreply(mess.error);
    }
}
break;

// Game Tebak Angka
case "tebakangka": {
    const target = Math.floor(Math.random() * 100);
        lenwy.tebakGame = { target, sender };
    lenwyreply("*Tebak Angka 1 - 100*\n*Ketik !tebak [Angka]*");
}
break;

case "tebak": {
    if (!lenwy.tebakGame || lenwy.tebakGame.sender !== sender) return;
        const guess = parseInt(args[0]);
    if (isNaN(guess)) return lenwyreply("❌ *Masukkan Angka!*");

    if (guess === lenwy.tebakGame.target) {
        lenwyreply(`🎉 *Tebakkan Kamu Benar!*`);
            delete lenwy.tebakGame;
        } else {
            lenwyreply(guess > lenwy.tebakGame.target ? "*Terlalu Tinggi!*" : "*Terlalu rendah!*");
    }
}
break;

case "quote": {
    const quotes = [
        "Jangan menyerah, hari buruk akan berlalu.",
        "Kesempatan tidak datang dua kali.",
        "Kamu lebih kuat dari yang kamu kira.",
        "Hidup ini singkat, jangan sia-siakan."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    lenwyreply(`*Quote Hari Ini :*\n_"${randomQuote}"_`);
}
break;

        default: { lenwyreply(mess.default) }
    }
}