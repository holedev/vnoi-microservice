import { MY_ENV } from '../configs/env/index.js';
import morgan from 'morgan';
import chalk from 'chalk';

const morganMiddleware = morgan(function (tokens, req, res) {
  return [
    chalk.hex('#ff4757').bold(new Date().toLocaleString()),
    chalk.hex('#34ace0').bold(tokens.method(req, res)),
    chalk.hex('#ff5252').bold(tokens.url(req, res)),
    chalk.hex('#ffb142').bold(tokens.status(req, res)),
    chalk.hex('#2ed573').bold(tokens['response-time'](req, res) + ' ms'),
    chalk.yellow(tokens['remote-addr'](req, res)),
  ].join(' ');
});

function sendErrorLog(text) {
  const endpoint = `https://api.telegram.org/bot${MY_ENV.BOT_TELEGRAM_TOKEN}/sendMessage`;
  const body = {
    chat_id: MY_ENV.BOT_TELEGRAM_CHAT_ID,
    text: text,
  };

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error('Error sending Telegram message:', error);
    });
}

export { sendErrorLog, morganMiddleware };
