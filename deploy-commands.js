// deploy-commands.js
require('dotenv/config');

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('discord.js');

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('เล่นเพลงจาก YouTube URL')
        .addStringOption(option =>
            option
                .setName('url')
                .setDescription('ลิงก์ YouTube')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('pause')
        .setDescription('หยุดเพลงชั่วคราว'),
    new SlashCommandBuilder()
        .setName('resume')
        .setDescription('เล่นเพลงต่อจากที่หยุดไว้'),
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('ข้ามเพลงปัจจุบัน'),
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('แสดงคิวเพลง'),
    new SlashCommandBuilder()
        .setName('join')
        .setDescription('เข้าห้องเสียงที่ผู้ใช้กำลังอยู่'),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('หยุดเล่นเพลง เคลียร์คิว และออกจากห้องเสียง'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
