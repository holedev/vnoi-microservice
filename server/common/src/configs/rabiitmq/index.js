import amqplib from "amqplib";
import { _EXCHANGE, _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";

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
      await channel.assertExchange(_EXCHANGE.CLASS_EXCHANGE, "fanout", { durable: true });
    }
    channel.on("close", () => {
      console.log("Channel close");
    });
    return channel;
  } catch (err) {
    sendLogTelegram("RABBITMQ::CREATE\n" + err);
  }
};

const publishMessage = async (msg) => {
  try {
    const channel = await getChannel();
    channel.publish(_EXCHANGE.CLASS_EXCHANGE, "", Buffer.from(JSON.stringify(msg)));
  } catch (err) {
    sendLogTelegram("RABBITMQ::PUBLISH\n" + err);
  }
};

export { publishMessage, getChannel };
