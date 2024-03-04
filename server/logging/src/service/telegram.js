import { _PROCESS_ENV } from "../configs/env/index.js";

const sendLogTelegram = async (text) => {
  const endpoint = `https://api.telegram.org/bot${_PROCESS_ENV.BOT_TELEGRAM_TOKEN}/sendMessage`;
  const body = {
    chat_id: _PROCESS_ENV.BOT_TELEGRAM_CHAT_ID,
    text: text
  };

  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).catch((error) => {
    console.error("Error sending Telegram message:", error);
  });
};

export { sendLogTelegram };
