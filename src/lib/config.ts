import { config } from "dotenv";
import { ERROR } from "./logCLI";

config();

if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
  console.error(
    ERROR({
      message:
        "ไม่พบ BOT_TOKEN หรือ CLIENT_ID ในไฟล์ .env กรุณาตรวจสอบการตั้งค่า",
    })
  );
  process.exit(1);
}

export const BOT_TOKEN = process.env.BOT_TOKEN;
export const CLIENT_ID = process.env.CLIENT_ID;
