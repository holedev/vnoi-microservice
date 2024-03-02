import amqplib from "amqplib";
import { _EXCHANGE, _PROCESS_ENV } from "../env/index.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";

const _TIMEOUT_REQUEST = 10000;
let amqplibConnection = null;

const createChannel = async () => {
  try {
    const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
    const channel = await connection.createChannel();
    return channel;
  } catch (err) {
    console.log(err);
  }
};

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  return await amqplibConnection.createChannel();
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

    channel.consume(q.queue, async (msg) => {
      if (msg?.content) {
        if (!msg.properties.replyTo) {
          service.handleEvent(JSON.parse(msg.content.toString()));
          channel.ack(msg);
          return;
        }
        // const response = await service.handleEvent(msg.content.toString());
        // console.log("RES", response);
        // channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
        //   correlationId: msg.properties.correlationId
        // });
        // channel.ack(msg);
        // console.log("DONE");
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export { createChannel, subscribeMessage };
