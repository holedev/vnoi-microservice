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
  // await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
  //   durable: false
  // });
  // channel.prefetch(1);
  // channel.consume(
  //   _PROCESS_ENV.SERVICE_NAME,
  //   async (msg) => {
  //     if (msg.content) {
  //       // DB Operation
  //       const payload = JSON.parse(msg.content.toString());
  //       const response = await service.serveRPCRequest(payload);
  //       channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
  //         correlationId: msg.properties.correlationId
  //       });
  //       channel.ack(msg);
  //     }
  //   },
  //   {
  //     noAck: false
  //   }
  // );

  await channel.assertExchange(_PROCESS_ENV.RABBITMQ_EXCHANGE_NAME, "direct", { durable: true });
  const q = await channel.assertQueue(`${_PROCESS_ENV.SERVICE_NAME}`, {
    durable: true
  });
  console.log(`Waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, _PROCESS_ENV.RABBITMQ_EXCHANGE_NAME, _PROCESS_ENV.SERVICE_NAME);

  channel.consume(
    q.queue,
    async (msg) => {
      if (msg.content) {
        console.log("The message is:", msg.content.toString());
        if (!msg.properties.replyTo) {
          service.handleEvent(msg.content.toString());
          return;
        }
        const response = await service.handleRequest(msg.content.toString());
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
          correlationId: msg.properties.correlationId
        });
        channel.ack(msg);
      }
    },
    {
      noAck: true
    }
  );
};

const requestData = async (QUEUE_NAME, requestPayload, uuid) => {
  try {
    const channel = await getChannel();
    const q = await channel.assertQueue(`${_PROCESS_ENV.SERVICE_NAME}::requestAsync`, {
      durable: true
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
      replyTo: q.queue,
      correlationId: uuid
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.close();
        resolve("API could not fullfil the request!");
      }, _TIMEOUT_REQUEST);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg.properties.correlationId == uuid) {
            console.log("data", JSON.parse(msg.content.toString()));
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject("Data Not found!");
          }
        },
        {
          noAck: true
        }
      );
    });
  } catch (error) {
    throw new InternalServerError(error.message);
  }
};

const requestAsync = async (QUEUE_NAME, requestPayload) => {
  const uuid = uuid4();
  return await requestData(QUEUE_NAME, requestPayload, uuid);
};

export { createChannel, publishMessage, subscribeMessage, requestAsync };
