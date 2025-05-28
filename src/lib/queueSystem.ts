import { createAudioPlayer, VoiceConnection } from "@discordjs/voice";

export type ServerQueue = {
  connection: VoiceConnection;
  player: ReturnType<typeof createAudioPlayer>;
  songs: string[];
};
export const queueMap = new Map<string, ServerQueue>();
