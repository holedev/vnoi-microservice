import amqplib from "amqplib";
import { _EXCHANGE, _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";
import { logInfo } from "./log.js";

let amqplibConnection = null;
let subscribeChannel = null;
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
      await channel.assertExchange(_EXCHANGE.USER_EXCHANGE, "fanout", { durable: true });
    }
    channel.on("close", () => {
      console.log("Channel close");
    });
    return channel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const getSubscribeChannel = async () => {
  try {
    const connection = await getConn();
    if (subscribeChannel === null) {
      subscribeChannel = await connection.createChannel();
    }
    subscribeChannel.on("close", () => {
      console.log("Subscribe channel close");
    });
    return subscribeChannel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const publishMessage = async (msg) => {
  try {
    const channel = await getChannel();
    channel.publish(_EXCHANGE.USER_EXCHANGE, "", Buffer.from(JSON.stringify(msg)));
  } catch (err) {
    sendLogTelegram("RABBITMQ::PUBLISH\n" + err);
  }
};

const subscribeMessage = async (channel, service) => {
  try {
    await channel.assertExchange(_EXCHANGE.CLASS_EXCHANGE, "fanout", { durable: true });
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    await channel.bindQueue(q.queue, _EXCHANGE.CLASS_EXCHANGE, "");
    console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | QUEUE ${q.queue} waiting`);

    channel.consume(
      q.queue,
      async (msg) => {
        if (msg.content) {
          const { action, data, requestId } = JSON.parse(msg.content.toString());
          logInfo(null, { requestId, method: "RABBITMQ-SUBSCRIBE", body: { action, data } });

          if (!msg.properties.replyTo) {
            service.handleEvent({ action, data });
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

export { getSubscribeChannel, subscribeMessage, publishMessage, getChannel };
