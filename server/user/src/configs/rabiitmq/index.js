import amqplib from "amqplib";
import { _EXCHANGE, _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";

let amqplibConnection = null;

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(_EXCHANGE.USER_EXCHANGE, "fanout", { durable: true });
    return channel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  return await amqplibConnection.createChannel();
};

const publishMessage = async (msg) => {
  try {
    const channel = await getChannel();
    channel.publish(_EXCHANGE.USER_EXCHANGE, "", Buffer.from(JSON.stringify(msg)));
  } catch (err) {
    sendLogTelegram("RABBITMQ::PUBLISH\n" + err);
  }
};

const subscribeMessage = async (service) => {
  try {
    const channel = await getChannel();

    await channel.assertExchange(_EXCHANGE.CLASS_EXCHANGE, "fanout", { durable: true });
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    await channel.bindQueue(q.queue, _EXCHANGE.CLASS_EXCHANGE, "");

    console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | QUEUE ${q.queue} waiting`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg?.content) {
          if (!msg.properties.replyTo) {
            service.handleEvent(JSON.parse(msg.content.toString()));
            channel.ack(msg);
            return;
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    sendLogTelegram("RABBITMQ::SUBSCRIBE\n" + err);
  }
};

export { createChannel, subscribeMessage, publishMessage };
