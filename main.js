// main.js
require('dotenv').config();
const { spawn } = require('child_process');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    StreamType
} = require('@discordjs/voice');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const queueMap = new Map();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options, member, guild } = interaction;
    const voiceChannel = member.voice.channel;

    if ((commandName === 'join' || commandName === 'play') && !voiceChannel) {
        return interaction.reply('❌ ต้องอยู่ในห้องเสียงก่อนครับ');
    }

    if (commandName === 'join') {
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        return interaction.reply(`✅ เข้าห้องเสียง **${voiceChannel.name}** แล้ว`);
    }

    if (commandName === 'play') {
        let url = options.getString('url');
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        // สร้าง queue ถ้ายังไม่มี
        let serverQueue = queueMap.get(guild.id);
        if (!serverQueue) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });
            const player = createAudioPlayer();
            connection.subscribe(player);
            player.on(AudioPlayerStatus.Idle, () => processQueue(guild.id));
            player.on('error', () => processQueue(guild.id));
            serverQueue = { connection, player, songs: [] };
            queueMap.set(guild.id, serverQueue);
        }

        serverQueue.songs.push(url);
        await interaction.reply(`🎶 เพิ่มลงคิว: ${url}`);
        if (serverQueue.player.state.status === AudioPlayerStatus.Idle) {
            processQueue(guild.id);
        }
    }

    if (commandName === 'leave') {
        const serverQueue = queueMap.get(guild.id);
        if (serverQueue) {
            serverQueue.connection.destroy();
            queueMap.delete(guild.id);
            return interaction.reply('👋 ออกจากห้องเสียงและเคลียร์คิวแล้ว');
        }
        return interaction.reply('❌ บอทไม่ได้อยู่ในห้องเสียงนี้');
    }
});

client.login(process.env.BOT_TOKEN);


/**
 * เล่นเพลงจากคิวทีละเพลง โดยใช้ yt-dlp.exe + ffmpeg
 */
async function processQueue(guildId) {
    const serverQueue = queueMap.get(guildId);
    if (!serverQueue) return;

    const { connection, player, songs } = serverQueue;

    if (songs.length === 0) {
        connection.destroy();
        queueMap.delete(guildId);
        return;
    }

    const nextUrl = songs.shift();

    // spawn yt-dlp ให้ส่ง bestaudio ออก stdout
    const yt = spawn('yt-dlp.exe', [
        '-f', 'bestaudio',
        '-o', '-',      // ส่งออกทาง stdout
        nextUrl
    ], { stdio: ['ignore', 'pipe', 'inherit'] });

    // ต่อเข้ากับ ffmpeg เพื่อแปลงเป็น raw PCM หรือ Opus ตามต้องการ
    const ffmpeg = spawn('ffmpeg', [
        '-i', 'pipe:0',
        '-f', 's16le',        // raw PCM
        '-ar', '48000',       // sample rate 48kHz
        '-ac', '2',           // stereo
        'pipe:1'
    ], { stdio: ['pipe', 'pipe', 'inherit'] });

    yt.stdout.pipe(ffmpeg.stdin);

    // สร้าง resource จาก ffmpeg.stdout
    const resource = createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw
    });

    player.play(resource);
    console.log('▶️ กำลังเล่น:', nextUrl);
}
