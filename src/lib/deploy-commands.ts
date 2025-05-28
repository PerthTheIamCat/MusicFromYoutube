import { CLIENT_ID } from "./config";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("ตอบกลับด้วย Pong! ใช้ได้เพื่อทดสอบบอท"),
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("เล่นเพลงจาก YouTube")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("URL ของเพลงหรือวิดีโอ YouTube")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("ข้ามเพลงปัจจุบันที่กำลังเล่น"),
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("หยุดการเล่นเพลงและออกจากช่องเสียง"),
  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("แสดงรายการเพลงที่กำลังเล่นอยู่"),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(CLIENT_ID);

async function deployCommands() {
  try {
    console.log("กำลังอัปโหลดคำสั่ง (/) Slash...");

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log("คำสั่ง (/) Slash ถูกอัปโหลดเรียบร้อยแล้ว!");
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปโหลดคำสั่ง Slash:", error);
  }
}
deployCommands();
