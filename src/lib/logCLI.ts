export function getDateAndTimeInThai() {
  const now = new Date();
  const day = now.toLocaleString("th-TH", {
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  const month = now.toLocaleString("th-TH", {
    month: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  const year = now.getFullYear() + 543;
  const hours = now.toLocaleString("th-TH", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Bangkok",
  });
  const minutes = now.toLocaleString("th-TH", {
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
  const seconds = now.toLocaleString("th-TH", {
    second: "2-digit",
    timeZone: "Asia/Bangkok",
  });

  return {
    day,
    month,
    year,
    hours,
    minutes,
    seconds,
  };
}
function formatDateTime() {
  const { day, month, year, hours, minutes, seconds } = getDateAndTimeInThai();
  return `[${day}/${month}/${year}][${hours}:${minutes}:${seconds}]`;
}

export const ERROR = ({ message }: { message: string }) =>
  `❌\t${formatDateTime()}\t${message}`;
export const INFO = ({ message }: { message: string }) =>
  `ℹ️\t${formatDateTime()}\t${message}`;
export const SUCCESS = ({ message }: { message: string }) =>
  `✅\t${formatDateTime()}\t${message}`;
export const WARNING = ({ message }: { message: string }) =>
  `⚠️\t${formatDateTime()}\t${message}`;
export const DEBUG = ({ message }: { message: string }) =>
  `🛠️\t${formatDateTime()}\t${message}`;
export const WORKING = ({ message }: { message: string }) =>
  `⚙️\t${formatDateTime()}\t${message}`;
