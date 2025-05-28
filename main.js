// main.js
require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options, member, guild, channel } = interaction;

    // /join command
    if (commandName === 'join') {
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ คุณต้องอยู่ในห้องเสียงก่อนสั่งให้บอทเข้าครับ');
        }
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        return interaction.reply(`✅ เข้าห้องเสียง **${voiceChannel.name}** แล้วครับ`);
    }

    // /play command
    if (commandName === 'play') {
        let url = options.getString('url');
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        if (!ytdl.validateURL(url)) {
            return interaction.reply('❌ ลิงก์ YouTube ไม่ถูกต้อง');
        }
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply('❌ คุณต้องอยู่ในห้องเสียงก่อนครับ');
        }

        // สร้าง connection และ player
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        connection.subscribe(player);

        // ผูก listener เพียงครั้งเดียว
        player.on(AudioPlayerStatus.Idle, () => {
            getVoiceConnection(guild.id)?.destroy();
            channel.send('✅ เล่นจบแล้ว ออกจากห้องเสียงครับ');
        });
        player.on('error', error => {
            console.error('AudioPlayer error:', error);
            getVoiceConnection(guild.id)?.destroy();
            channel.send('❌ เกิดข้อผิดพลาดขณะเล่นเพลง');
        });

        // สั่งเล่นด้วย retry logic
        playWithRetry(url, player, connection);
        return interaction.reply(`▶️ กำลังเล่นเพลง: ${url}`);
    }

    // /leave command
    if (commandName === 'leave') {
        const conn = getVoiceConnection(guild.id);
        if (conn) conn.destroy();
        return interaction.reply('👋 ออกจากห้องเสียงเรียบร้อยแล้ว');
    }
});

client.login(process.env.BOT_TOKEN);

/**
 * เล่นเพลงและ retry เมื่อ stream ถูกปิด
 * @param {string} url
 * @param {AudioPlayer} player
 * @param {VoiceConnection} connection
 * @param {number} retries
 */
function playWithRetry(url, player, connection, retries = 3) {
    const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25 // ~32MB buffer
    });
    const resource = createAudioResource(stream);
    player.play(resource);

    stream.on('error', err => {
        console.error('Stream error:', err);
    });

    stream.on('close', () => {
        if (retries > 0) {
            console.log(`Stream closed, retrying... (${retries} left)`);
            playWithRetry(url, player, connection, retries - 1);
        } else {
            console.error('Stream failed after retries');
            connection.destroy();
        }
    });
}