import amqplib from "amqplib";
import { _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../service/telegram.js";

let amqplibConnection = null;
let channel = null;

const getConn = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  amqplibConnection.on("close", () => console.log("Connect close!"));
  return amqplibConnection;
};

const getChannel = async () => {
  try {
    const connection = await getConn();
    if (channel === null) {
      channel = await connection.createChannel();
    }
    channel.on("close", () => {
      console.log("Channel close");
    });
    return channel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
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

export { getChannel, subscribeMessage };
