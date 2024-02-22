import amqplib from "amqplib";
import uuid4 from "uuid4";
import { _PROCESS_ENV } from "../env/index.js";
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";

const _TIMEOUT_REQUEST = 10000;
let amqplibConnection = null;

const createChannel = async () => {
  const connection = await amqplib.connect(_PROCESS_ENV.RABBITMQ_URL);
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
    await channel.assertExchange(_PROCESS_ENV.RABBITMQ_EXCHANGE_NAME, "direct", { durable: true });
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });
    console.log(`Waiting for messages in queue: ${q.queue}`);

    channel.bindQueue(q.queue, _PROCESS_ENV.RABBITMQ_EXCHANGE_NAME, _PROCESS_ENV.SERVICE_NAME);

    channel.consume(
      _PROCESS_ENV.SERVICE_NAME,
      async (msg) => {
        if (msg.content) {
          console.log("The message is:", msg.content.toString());
          if (!msg.properties.replyTo) {
            console.log("No replyTo property, so it is a log message");
            service.handleEvent(msg.content.toString());
            channel.ack(msg);
            return;
          }
          // const response = await service.handleEvent(msg.content.toString());
          // console.log("RES", response);
          // channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          //   correlationId: msg.properties.correlationId
          // });
          // console.log("DONE");
          // channel.ack(msg);
        }
      },
      {
        noAck: true
      }
    );
  } catch (error) {
    throw new InternalServerError(error.message);
  }
};

const RPCObserver = async (RPC_QUEUE_NAME, service) => {
  const channel = await getChannel();
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false
  });
  channel.prefetch(1);
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (msg.content) {
        // DB Operation
        const payload = JSON.parse(msg.content.toString());
        const response = await service.handleEvent(payload);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId
        });
        channel.ack(msg);
      }
    },
    {
      noAck: false
    }
  );
};

export { createChannel, publishMessage, subscribeMessage, RPCObserver };
