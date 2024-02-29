import amqplib from "amqplib";
import uuid4 from "uuid4";
import { _EXCHANGE, _PROCESS_ENV } from "../env/index.js";
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

const subscribeMessage = async (service) => {
  try {
    const channel = await getChannel();
    await channel.assertExchange(_EXCHANGE.CLASS_EXCHANGE, "fanout", { durable: true });
    const q = await channel.assertQueue(_PROCESS_ENV.SERVICE_NAME, {
      durable: true
    });

    await channel.bindQueue(q.queue, _EXCHANGE.CLASS_EXCHANGE, "");
    console.log(`Waiting for messages in queue: ${q.queue}`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
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
  } catch (error) {
    throw new InternalServerError(error.message);
  }
};

const requestData = async (QUEUE_NAME, requestPayload, uuid) => {
  const channel = await getChannel();

  try {
    const q = await channel.assertQueue(`${_PROCESS_ENV.SERVICE_NAME}::REQUEST-ASYNC`, {
      durable: false
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
      replyTo: q.queue,
      correlationId: uuid
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.close();
        resolve("TIMEOUT | API could not fullfil the request!");
      }, _TIMEOUT_REQUEST);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg.properties.correlationId == uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject("Data Not found!");
          }
          channel.ack(msg);
          channel.cancel(msg.fields.consumerTag);
        },
        {
          noAck: false
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
};

const requestAsync = async (QUEUE_NAME, requestPayload) => {
  const uuid = uuid4();
  return await requestData(QUEUE_NAME, requestPayload, uuid);
};

export { createChannel, subscribeMessage, requestAsync };
