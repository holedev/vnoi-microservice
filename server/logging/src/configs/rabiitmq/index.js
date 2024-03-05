import amqplib from "amqplib";
import { _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../service/telegram.js";

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
    const channel = await connection.createChannel();
    return channel;
  } catch (err) {
    sendLogTelegram(`${_PROCESS_ENV.SERVICE_NAME}:${_PROCESS_ENV.SERVICE_PORT}\nTYPE: RABBITMQ::CREATE\n${err}`);
  }
};

const subscribeMessage = async (channel, service) => {
  try {
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | QUEUE ${q.queue} waiting`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg.content) {
          service.handleEvent(JSON.parse(msg.content.toString()));
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    sendLogTelegram(`${_PROCESS_ENV.SERVICE_NAME}:${_PROCESS_ENV.SERVICE_PORT}\nTYPE: RABBITMQ::SUBSCRIBE\n${err}`);
  }
};

export { createChannel, subscribeMessage };
