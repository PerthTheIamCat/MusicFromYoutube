import { BOT_TOKEN } from "./lib/config";
import { ERROR, SUCCESS, WORKING } from "./lib/logCLI";
import { command_join, command_leave } from "./lib/commands";
import {
  Client,
  GatewayIntentBits,
  Events,
  CommandInteraction,
  Interaction,
  GuildMember,
  ActivityType,
} from "discord.js";
import {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  VoiceConnection,
} from "@discordjs/voice";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, () => {
  console.log(
    SUCCESS({
      message: `พร้อมใช้งานในฐานะ ${client.user?.tag}`,
    })
  );
  client.user?.setActivity("กำลังรอคำสั่ง", {
    type: ActivityType.Custom,
  });
});

console.log(WORKING({ message: "กำลังตรวจสอบ platform สำหรับ yt-dlp" }));
const OS = process.platform;
const ytDlpBinary = (() => {
  switch (OS) {
    case "win32":
      return "yt-dlp.exe";
    case "darwin":
      return "yt-dlp_macos";
    default:
      console.error(
        ERROR({
          message: `แพลตฟอร์ม ${OS} ไม่รองรับ yt-dlp ที่มีให้. กรุณาใช้ Windows หรือ macOS.`,
        })
      );
      process.exit(1);
  }
})();

console.log(
  SUCCESS({ message: `กำลังใช้ yt-dlp binary: ${ytDlpBinary} สำหรับ ${OS}` })
);

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  const cmd = interaction as CommandInteraction;
  if (!interaction.isCommand()) return;
  const { commandName } = cmd;
  if (!interaction.isCommand()) return;

  if (commandName === "join") {
    command_join(cmd);
  } else if (commandName === "stop") {
    command_leave(cmd);
  } else {
    cmd.reply({
      content: "คำสั่งนี้ไม่รองรับ",
      ephemeral: true,
    });
  }
});

client.on(Events.VoiceStateUpdate, (oldState, newState) => {
  const oldConnection = getVoiceConnection(oldState.guild.id);
  if (!oldConnection) return;

  if (newState.channelId === null && oldState.channelId !== null) {
    oldConnection.destroy();
    console.log(
      SUCCESS({
        message: `ออกจากห้องเสียง ${oldState.channelId} เพราะไม่มีคนอยู่แล้ว`,
      })
    );
  }
});

client.login(BOT_TOKEN);
