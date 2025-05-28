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
import { queueMap, ServerQueue } from "./queueSystem";

export function command_join(cmd: CommandInteraction) {
  const { commandName, member, guild } = cmd;
  if (commandName !== "join") return;
  if (!(member instanceof GuildMember)) {
    cmd.reply({
      content: "คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์เท่านั้น",
      ephemeral: true,
    });
    return;
  }
  if (!guild) {
    cmd.reply({
      content: "คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์เท่านั้น",
      ephemeral: true,
    });
    return;
  }
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    cmd.reply({
      content: "คุณต้องอยู่ในห้องเสียงก่อนที่จะใช้คำสั่งนี้",
      ephemeral: true,
    });
    return;
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
  });

  connection.on("error", (error) => {
    console.error(`Error connecting to voice channel: ${error}`);
    cmd.reply({
      content: "เกิดข้อผิดพลาดในการเชื่อมต่อกับห้องเสียง",
      ephemeral: true,
    });
  });
  connection.on("stateChange", (oldState, newState) => {
    if (newState.status === "ready") {
      cmd.reply({
        content: `เข้าร่วมห้องเสียง ${voiceChannel.name} สำเร็จ!`,
      });
    } else if (newState.status === "disconnected") {
      cmd.reply({
        content: "ถูกตัดการเชื่อมต่อจากห้องเสียง",
      });
    }
  });
}

export function command_leave(cmd: CommandInteraction) {
  const { guildId } = cmd;
  if (!guildId || !queueMap.has(guildId)) {
    cmd.reply({
      content: "ไม่มีการเล่นเพลงในขณะนี้",
      ephemeral: true,
    });
    return;
  }
  const queue: ServerQueue = queueMap.get(guildId)!;
  const connection = getVoiceConnection(guildId);
  if (!connection) {
    cmd.reply({
      content: "ไม่พบการเชื่อมต่อห้องเสียง",
      ephemeral: true,
    });
    return;
  }
  connection.destroy();
  queueMap.delete(guildId);
  cmd.reply({
    content: "ออกจากห้องเสียงและหยุดการเล่นเพลง",
    ephemeral: true,
  });
  console.log(
    `ออกจากห้องเสียง ${connection.joinConfig.channelId} และหยุดการเล่นเพลง`
  );
  if (queue.player) {
    queue.player.stop();
  }
  if (queue.songs.length > 0) {
    queue.songs = [];
    console.log("ล้างรายการเพลงในคิว");
  }
}

export function command_play(
  cmd: CommandInteraction,
  url: string,
  yt_dlpBinary: string
) {
  const { commandName, guildId, guild } = cmd;
  if (!cmd.isCommand() || commandName !== "play") return;
  if (!url) {
    cmd.reply({
      content: "กรุณาใส่ URL ของเพลงหรือวิดีโอ YouTube",
      ephemeral: true,
    });
    return;
  }
  if (!guild) {
    cmd.reply({
      content: "คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์เท่านั้น",
      ephemeral: true,
    });
    return;
  }
  if (!guildId) {
    cmd.reply({
      content: "คำสั่งนี้ใช้ได้เฉพาะในเซิร์ฟเวอร์เท่านั้น",
      ephemeral: true,
    });
    return;
  }

  const voiceChannel = (cmd.member as GuildMember).voice.channel;
  if (!voiceChannel) {
    cmd.reply({
      content: "คุณต้องอยู่ในห้องเสียงก่อนที่จะใช้คำสั่งนี้",
      ephemeral: true,
    });
    return;
  }

  let queue: ServerQueue;
  if (queueMap.has(guildId)) {
    queue = queueMap.get(guildId)!;
  } else {
    queue = {
      connection: joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guildId,
        adapterCreator: guild.voiceAdapterCreator,
      }),
      player: createAudioPlayer(),
      songs: [],
    };
    queueMap.set(guildId, queue);
  }

  const resource = createAudioResource(
    spawn(yt_dlpBinary, ["-f", "bestaudio", "-o", "-", url], {
      stdio: ["ignore", "pipe", "ignore"],
    }).stdout,
    { inputType: StreamType.Arbitrary }
  );

  queue.player.play(resource);
  queue.connection.subscribe(queue.player);

  queue.player.on(AudioPlayerStatus.Playing, () => {
    cmd.reply({
      content: `กำลังเล่นเพลงจาก URL: ${url}`,
    });
  });

  queue.player.on("error", (error) => {
    console.error(`Error playing audio: ${error.message}`);
    cmd.reply({
      content: "เกิดข้อผิดพลาดในการเล่นเพลง",
      ephemeral: true,
    });
  });

  if (queue.songs.length === 0) {
    queue.songs.push(url);
  } else {
    queue.songs.push(url);
  }
}
