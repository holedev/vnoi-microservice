import amqplib from "amqplib";
import uuid4 from "uuid4";
import { _PROCESS_ENV } from "../env/index.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";

const _TIMEOUT_REQUEST = 10000;
let amqplibConnection = null;

const createChannel = async () => {
  const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  connection.on("error", (err) => {
    console.log("Error", err);
  });
  const channel = await connection.createChannel();
  await channel.assertExchange(_PROCESS_ENV.RABBITMQ_EXCHANGE_NAME, "direct", { durable: true });
  return channel;
};

const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
  }
  return await amqplibConnection.createChannel();
};

const publishMessage = (channel, service, msg) => {
  channel.publish(_PROCESS_ENV.RABBITMQ_EXCHANGE_NAME, service, Buffer.from(msg));
  console.log("Sent: ", msg);
};

const subscribeMessage = async (channel, service) => {
  try {
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    channel.prefetch(1);

    console.log(`Waiting for messages in queue: ${q.queue}`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        console.log("The message is:", msg.content.toString());
        if (!msg.properties.replyTo) {
          console.log("No replyTo property, so it is a log message");
          service.handleEvent(msg.content.toString());
          channel.ack(msg);
          return;
        }
        const response = await service.handleEvent(msg.content.toString());
        console.log("RES", response);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId
        });
        channel.ack(msg);
        console.log("DONE");
      }
    });
  } catch (error) {
    throw new InternalServerError(error.message);
  }
};

export { createChannel, publishMessage, subscribeMessage };
