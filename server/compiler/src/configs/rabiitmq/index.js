import amqplib from "amqplib";
import uuid4 from "uuid4";
import { _PROCESS_ENV } from "../env/index.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";

const _TIMEOUT_REQUEST = 10000;
let amqplibConnection = null;

const createChannel = async () => {
  const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  connection.on("error", (err) => {
    console.log("Error connection: ", err);
  });
  const channel = await connection.createChannel();
  channel.on("error", (err) => {
    console.log("Error channel: ", err);
  });
  return channel;
};

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  return await amqplibConnection.createChannel();
};

const subscribeMessage = async (channel, service) => {
  const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
    durable: true
  });

  channel.prefetch(1);
  console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | QUEUE ${q.queue} waiting`);
  channel.consume(
    q.queue,
    async (msg) => {
      if (msg.content) {
        if (!msg.properties.replyTo) {
          service.handleEvent(msg.content.toString());
          channel.ack(msg);
          return;
        }
        try {
          const response = await service.handleEvent(msg.content.toString());
          channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
            correlationId: msg.properties.correlationId
          });
          channel.ack(msg);
        } catch (err) {
          console.log(err);
        }
      }
    },
    {
      noAck: false
    }
  );
};

export { createChannel, subscribeMessage };
