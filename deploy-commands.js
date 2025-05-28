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
        .setName('join')
        .setDescription('ให้บอทเข้าห้องเสียงของคุณ'),
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
        .setName('leave')
        .setDescription('ให้ออกจากห้องเสียงและหยุดเพลง')
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
