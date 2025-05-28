// src/main.ts
import * as dotenv from "dotenv";
dotenv.config();

import { spawn } from "child_process";
import {
  Client,
  GatewayIntentBits,
  Events,
  CommandInteraction,
  Interaction,
  GuildMember,
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

type ServerQueue = {
  connection: VoiceConnection;
  player: ReturnType<typeof createAudioPlayer>;
  songs: string[];
};

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// เก็บคิวเพลงของแต่ละ Guild
const queueMap = new Map<string, ServerQueue>();

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isCommand()) return;

  const cmd = interaction as CommandInteraction;
  const { commandName, options, member, guild } = cmd;

  const voiceChannel = (member as GuildMember)?.voice?.channel;
  if ((commandName === "join" || commandName === "play") && !voiceChannel) {
    await cmd.reply("❌ ต้องอยู่ในห้องเสียงก่อนครับ");
    return;
  }
});

client.login(process.env.BOT_TOKEN);
